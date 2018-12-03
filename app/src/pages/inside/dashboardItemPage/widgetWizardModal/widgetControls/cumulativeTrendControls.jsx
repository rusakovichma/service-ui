import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues, initialize } from 'redux-form';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { STATS_FAILED, STATS_PASSED, STATS_SKIPPED } from 'common/constants/statistics';
import { validate } from 'common/utils';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION, ITEMS_INPUT_WIDTH } from './constants';
import { FiltersControl, DropdownControl, InputControl } from './controls';
import { WIDGET_WIZARD_FORM } from '../widgetWizardContent/wizardControlsSection/constants';

const DEFAULT_ITEMS_COUNT = '10';
const STATIC_CONTENT_FIELDS = [STATS_FAILED, STATS_SKIPPED, STATS_PASSED];
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'CumulativeTrendControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'CumulativeTrendControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  attributeKeyFieldLabel: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabel',
    defaultMessage: 'Attribute key',
  },
  attributeKeyFieldPlaceholder: {
    id: 'CumulativeTrendControls.attributeKeyFieldPlaceholder',
    defaultMessage: 'Enter an attribute key',
  },
  attributeKeyFieldTip: {
    id: 'CumulativeTrendControls.attributeKeyFieldTip',
    defaultMessage: 'To view a dynamic of a definite attribute you should type its key',
  },
  ItemsValidationError: {
    id: 'LaunchStatisticsControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 10',
  },
  attributeKeyValidationError: {
    id: 'LaunchStatisticsControls.attributeKeyValidationError',
    defaultMessage: 'Value should have size from 1 to 128',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 10)) &&
    formatMessage(messages.ItemsValidationError),
  attributeKey: (formatMessage) => (value) =>
    (!value || !validate.attributeKey(value)) &&
    formatMessage(messages.attributeKeyValidationError),
};

@injectIntl
@connect(
  (state) => ({
    widgetSettings: getFormValues(WIDGET_WIZARD_FORM)(state),
  }),
  {
    initializeWizardSecondStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
export class CumulativeTrendControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeWizardSecondStepForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, initializeWizardSecondStepForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION],
      intl.formatMessage,
    );
    initializeWizardSecondStepForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_ITEMS_COUNT,
        contentFields: this.parseContentFields(this.criteria),
        widgetOptions: {
          attributeKey: '',
        },
      },
    });
  }

  formatContentFields = (criteries) =>
    criteries.filter((criteria) => STATIC_CONTENT_FIELDS.indexOf(criteria) === -1);
  parseContentFields = (criteries) =>
    criteries
      ? STATIC_CONTENT_FIELDS.concat(
          criteries
            .map((criteria) => criteria.value || criteria)
            .reduce((acc, val) => acc.concat(val), []),
        )
      : this.props.widgetSettings.contentParameters.contentFields;

  parseItems = (value) =>
    value.length < 3 ? value : this.props.widgetSettings.contentParameters.itemsCount;

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  render() {
    const { intl, formAppearance, onFormAppearanceChange } = this.props;
    return (
      <Fragment>
        <FieldProvider
          name="filterIds"
          parse={this.parseFilterValue}
          format={this.formatFilterValue}
        >
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.widgetOptions.attributeKey"
          validate={validators.attributeKey(intl.formatMessage)}
        >
          <InputControl
            fieldLabel={intl.formatMessage(messages.attributeKeyFieldLabel)}
            placeholder={intl.formatMessage(messages.attributeKeyFieldPlaceholder)}
            tip={intl.formatMessage(messages.attributeKeyFieldTip)}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.contentFields"
          parse={this.parseContentFields}
          format={this.formatContentFields}
        >
          <DropdownControl
            fieldLabel={intl.formatMessage(messages.CriteriaFieldLabel)}
            multiple
            selectAll
            options={this.criteria}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.itemsCount"
          validate={validators.items(intl.formatMessage)}
          parse={this.parseItems}
        >
          <InputControl
            fieldLabel={intl.formatMessage(messages.ItemsFieldLabel)}
            inputWidth={ITEMS_INPUT_WIDTH}
            type="number"
          />
        </FieldProvider>
      </Fragment>
    );
  }
}

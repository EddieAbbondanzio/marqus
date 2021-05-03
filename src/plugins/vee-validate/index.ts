import AllRules from '@vee-validate/rules';
import { configure, defineRule } from 'vee-validate';
import { localize } from '@vee-validate/i18n';
import { unique } from './rules/unique';

Object.keys(AllRules).forEach((rule) => {
    defineRule(rule, AllRules[rule]);
});

defineRule('unique', unique);

configure({
    generateMessage: localize('en', {
        messages: {
            required: '{field} is required',
            unique: '{field} already exists'
        }
    })
});

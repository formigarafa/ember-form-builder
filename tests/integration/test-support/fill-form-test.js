import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { fillForm } from 'ember-form-builder/test-support';
import hbs from 'htmlbars-inline-precompile';

module('Integration | TestSupport | fillForm', function(hooks) {
  setupRenderingTest(hooks);

  test('it writes model data', async function(assert) {
    this.model = {
      firstName:  'Jan',
      age:        37
    };
    await render(hbs`
      {{#form-builder for=model name="person" as |f|}}
        {{f.input "firstName"}}
        {{f.input "age" as="number"}}
      {{/form-builder}}
    `);

    let newData = {
      firstName:  'Wilhelm',
      age:        17
    };
    await fillForm('person', newData);

    assert.deepEqual(this.model, newData);
  });

  test('it writes nested object data', async function(assert) {
    this.model = {
      address: {
        street: 'Elm Str'
      }
    };
    await render(hbs`
      {{#form-builder for=model name="person" as |f|}}
        {{#f.fields for=model.address name="address" as |ff|}}
          {{ff.input "street"}}
        {{/f.fields}}
      {{/form-builder}}
    `);

    let newData = {
      address: {
        street: 'Sesame Str'
      }
    };

    await fillForm('person', newData);

    assert.deepEqual(this.model, newData);
  });

  test('it writes nested array data', async function(assert) {
    this.model = {
      children: [
        { firstName: 'Jan' },
        { firstName: 'Anna' }
      ]
    };
    await render(hbs`
      {{#form-builder for=model name="person" as |f|}}
        {{#each model.children as |child i|}}
          {{#f.fields for=child name="child" index=i as |ff|}}
            {{ff.input "firstName"}}
          {{/f.fields}}
        {{/each}}
      {{/form-builder}}
    `);

    let newData = {
      children: [
        undefined,
        { firstName: 'Kris' }
      ]
    };

    await fillForm('person', newData);

    assert.deepEqual(this.model, {
      children: [
        { firstName: 'Jan' },
        { firstName: 'Kris' }
      ]
    });
  });
});

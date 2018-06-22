import { camelize } from '@ember/string';
import { isPresent } from '@ember/utils';
import { Promise as EmberPromise } from 'rsvp';
import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';
import findModel from "ember-form-builder/utilities/find-model";

export default EmberObject.extend({
  status: null,

  isValid: true,

  isLoading: computed("model.isSaving", "object.isLoading", function() {
    var objectIsLoading = this.get("object.isLoading");
    return objectIsLoading === true || objectIsLoading === false ?
      objectIsLoading : this.get("model.isSaving");
  }),


  children: computed(function() {
    return A([]);
  }),

  init: function() {
    if (this.get("isEmberData") && this.get("model").on) {
      this.get("model").on("didCreate", this, this._setSuccessStatus);
      this.get("model").on("didUpdate", this, this._setSuccessStatus);
      this.get("model").on("becameInvalid", this, this._setFailureStatus);
    }
  },

  willDestroy: function() {
    if (this.get("isEmberData") && this.get("model").off) {
      this.get("model").off("didCreate", this, this._setSuccessStatus);
      this.get("model").off("didUpdate", this, this._setSuccessStatus);
      this.get("model").off("becameInvalid", this, this._setFailureStatus);
    }
  },

  addChild(childFormBuilder) {
    this.get("children").addObject(childFormBuilder);
  },

  removeChild(childFormBuilder) {
    this.get("children").removeObject(childFormBuilder);
  },

  validate() {
    var validations = [];

    validations.push(this.validateObject());

    this.get("children").forEach((child) => {
      validations.push(child.validate());
    });

    return new EmberPromise((resolve, reject) => {
      EmberPromise.all(validations).then(
        () => { this.set("isValid", true); resolve(); },
        () => { this.set("isValid", false); reject(); }
      );
    });
  },

  model: computed("object", function() {
    return findModel(this.get("object"));
  }),

  isEmberData: computed("model", function() {
    return isPresent(this.get("model.constructor.modelName"));
  }),

  modelName: computed("model", function() {
    return this.get("model.constructor.modelName");
  }),

  translationKey: computed("model", function() {
    return camelize(this.get("model.constructor.modelName") || "");
  }),

  _setSuccessStatus: function() {
    this.set("status", "success");
  },

  _setFailureStatus: function() {
    this.set("isValid", false);
    this.set("status", "failure");
  },

  // defined in validations mixin
  errorsPathFor() {},
  validateObject() {}
});

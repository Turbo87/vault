import Ember from 'ember';
import DS from 'ember-data';
import { TABS } from 'vault/helpers/tabs-for-identity-show';

export default Ember.Route.extend({
  model(params) {
    let { section } = params;
    let itemType = this.modelFor('vault.cluster.access.identity');
    let tabs = TABS[itemType];
    let modelType = `identity/${itemType}`;
    if (!tabs.includes(section)) {
      const error = new DS.AdapterError();
      Ember.set(error, 'httpStatus', 404);
      throw error;
    }

    // if the record is in the store use that
    let model =
      this.store.peekRecord(modelType, params.item_id) || this.store.findRecord(modelType, params.item_id);

    return Ember.RSVP.hash({
      model,
      section,
    });
  },

  activate() {
    // if we're just entering the route, and it's not a hard reload
    // reload to make sure we have the newest info
    if (this.currentModel) {
      Ember.run.next(() => {
        this.controller.get('model').reload();
      });
    }
  },

  afterModel(resolvedModel) {
    let { section, model } = resolvedModel;
    if (model.get('identityType') === 'group' && model.get('type') === 'internal' && section === 'aliases') {
      return this.transitionTo('vault.cluster.access.identity.show', model.id, 'details');
    }
  },

  setupController(controller, resolvedModel) {
    let { model, section } = resolvedModel;
    controller.setProperties({
      model,
      section,
    });
  },
});

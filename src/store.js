import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({

    state: {

        _people: [],

        _items: []

    },

    mutations: {

        ADD_ITEM(state, item) {

            const items = state._items.filter(_item => _item.id !== item.id)
            items.push(item)
            state._items = items

        },

        SET_ITEMS(state, items) {

            state._items = items

        },


        ADD_PERSON(state, person) {

            state._people.push(person)

        },

        REMOVE_PERSON(state, person) {

            // REMOVE PERSON FROM SHARES AND UPDATE PAYER
            state._items = state._items.map(item => {

                if (item.share.indexOf(person.id) !== -1)
                    item.share.splice(item.share.indexOf(person.id), 1)

                if (item.payer === person.id)
                    item.payer = person.alterPayer

                return item
            })

            // REMOVE PERSON FROM PEOPLE
            state._people = state._people.filter(p => p.id !== person.id)

        },

        UPDATE_PERSON(state, newPerson) {

            state._people = state._people.map(person => person.id === newPerson.id ? newPerson : person)

        },

        SET_PEOPLE(state, people) {

            state._people = people

        }

    },

    actions: {

        addItem({commit, getters}, item) {

            commit("ADD_ITEM", {
                id: getters.newId,
                ...item
            });
        },

        setItems({commit}, items) {
            commit("SET_ITEMS", items);
        },


        addPerson({commit, getters}, person) {
            commit("ADD_PERSON", {
                id: getters.newId,
                name: person
            });
        },

        removePerson({commit}, person) {
            commit("REMOVE_PERSON", person);
        },

        updatePerson({commit}, person) {
            commit("UPDATE_PERSON", person);
        },

        setPeople({commit}, people) {
            commit("SET_PEOPLE", people);
        },

    },

    getters: {

        people(state, getters) {

            // make fucking clone of people
            let people = []
            for (const person of state._people) {
                people.push({
                    id: person.id,
                    name: person.name,
                })
            }

            // convert people array to object
            people = people.reduce((obj, item) => {
                obj[item.id] = item
                return obj
            }, {})


            // add people totalPay
            for (const personId in people) {

                people[personId].totalPay = state._items.reduce((prev, item) => {
                    return prev += item.payer === +personId ? item.price : 0
                }, 0);

            }


            // add people totalCost
            for (const personId in people) {

                people[personId].totalCost = state._items.reduce((prev, item) => {
                    return prev += item.share.indexOf(+personId) !== -1 ? item.price / item.share.length : 0
                }, 0);

            }


            // add people debt
            for (const personId in people) {

                const customCost = state._items.reduce((prev, curr) => {
                    if (curr.share.length < state._people.length) // NOT share between all
                        if (curr.share.indexOf(+personId) != -1)
                            return prev += (curr.price / curr.share.length)
                    return prev
                }, 0)


                people[personId].debt = getters.totalCostPerPerson + customCost - people[personId].totalPay
            }


            // add people sharedItems
            for (const personId in people)
                people[personId].sharedItems = state._items.filter(item => item.share.indexOf(+personId) != -1)


            // add people paidItems
            for (const personId in people)
                people[personId].paidItems = state._items.filter(item => item.payer === +personId)


            return people


        },

        items(state) {
            return state._items.reduce((obj, item) => {
                obj[item.id] = item
                return obj
            }, {})
        },

        peopleCount(state) {
            return state._people.length
        },

        itemsCount(state) {
            return state._items.length
        },

        totalCost(state) {
            return state._items.reduce((prev, curr) => {
                if (curr.share.length === state._people.length) // share between all
                    return prev += curr.price
                return prev
            }, 0)
        },

        totalCostPerPerson(state, getters) {
            return getters.totalCost / state._people.length
        },

        mostPayerId(state, getters) {

            let mostPay = 0
            let mostPayerId = ''

            for (const personId in getters.people) {
                if (getters.people[personId].totalPay > mostPay) {
                    mostPay = getters.people[personId].totalPay
                    mostPayerId = personId
                }
            }

            return +mostPayerId

        },

        peopleId(state) {
            return state._people.map(person => person.id)
        },

        newId(state) {
            let lastId = 0
            state._people.map(person => lastId = person.id > lastId ? person.id : lastId)
            state._items.map(item => lastId = item.id > lastId ? item.id : lastId)
            return ++lastId
        }

    }

})

<template>

    <v-layout wrap>

        <v-flex xs12>

            <edit-person :personId="person.id" />

            <remove-person :person="person" />

            <h1>{{person.name}}</h1>

            <p>
                <b v-show="person.debt !== 0">{{ Math.round(Math.abs(person.debt)) | currency }}</b>&nbsp;

                <span v-show="person.debt > 0" class="red--text">must pay</span>
                <span v-show="person.debt < 0" class="green--text">must be paid</span>
                <span v-show="person.debt === 0" class="grey--text text--darken-2">we are even :)</span>
            </p>

        </v-flex>

        <v-flex xs12>
            <v-tabs fixed-tabs v-model="tab" color="grey lighten-4" slider-color="teal">

                <v-tab v-for="item in ['costs', 'payments']" :key="item" ripple>{{item}}</v-tab>

                <v-tab-item v-for="n in 2" :key="n">
                    <v-card flat color="transparent">

                        <v-list two-line class="transparent" v-if="tab === 0">
                            <template v-for="(item, index) in person.sharedItems">
                                <v-list-tile :key="item.id">

                                    <v-list-tile-content>

                                        <v-list-tile-title>
                                            {{item.title}}:
                                            <b>{{Math.round(item.price / item.share.length) | currency}}</b>
                                        </v-list-tile-title>

                                        <v-list-tile-sub-title>
                                            paid by <span class="grey--text text--darken-3">{{item.payer === person.id ? 'you' : $store.getters.people[item.payer].name}}</span>
                                        </v-list-tile-sub-title>
                                    </v-list-tile-content>

                                </v-list-tile>

                                <v-divider :key="item.id - 1" v-if="index < person.sharedItems.length - 1"></v-divider>
                            </template>

                            <v-list-tile>
                                <v-list-tile-content>
                                    <v-list-tile-title class="text-xs-center teal--text">
                                        <h3>
                                            <span class="font-weight-regular">Total Costs: </span>
                                            <span>{{Math.round(person.totalCost) | currency}}</span>
                                        </h3>
                                    </v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>

                        </v-list>

                        <v-list two-line class="transparent" v-else>
                            <template v-for="(item, index) in person.paidItems">
                                <v-list-tile :key="item.id">

                                    <v-list-tile-content>
                                        <v-list-tile-title>
                                            {{item.title}}:
                                            <b>{{item.price | currency}}</b>
                                        </v-list-tile-title>
                                        <v-list-tile-sub-title>share between
                                            <span class="grey--text text--darken-3">
                                                <span v-for="id in item.share" :key="id" class="shared-person">{{id === person.id ? 'You' : $store.getters.people[id].name}}</span>
                                            </span>
                                        </v-list-tile-sub-title>
                                    </v-list-tile-content>

                                </v-list-tile>

                                <v-divider :key="item.id - 1" v-if="index < person.paidItems.length - 1"></v-divider>
                            </template>

                            <v-list-tile>
                                <v-list-tile-content>
                                    <v-list-tile-title class="text-xs-center teal--text">
                                        <h3>
                                            <span class="font-weight-regular">Total Payments: </span>
                                            <span>{{Math.round(person.totalPay) | currency}}</span>
                                        </h3>
                                    </v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>

                        </v-list>

                    </v-card>
                </v-tab-item>

            </v-tabs>
        </v-flex>


        <v-flex>

        </v-flex>

    </v-layout>

</template>

<script>

    import removePerson from '@/components/removePerson.vue'
    import editPerson from '@/components/editPerson.vue'

    export default {

        components:{
            removePerson,
            editPerson
        },

        data() {
            return {
                tab: null
            }
        },

        props: ['personId'],

        computed: {

            person() {
                return this.$store.getters.people[this.personId]
            }

        },

        created() {

            if (!this.person)
                this.$router.replace('/receipt')
        }

    }
</script>

<style lang="scss">
    .shared-person {
        &:not(:last-child):after {
            content: ', ';
            color: rgba(0, 0, 0, 0.54)
        }
    }
</style>
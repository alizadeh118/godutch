<template>

    <v-dialog v-model="dialog" max-width="600px">

        <template v-slot:activator={on}>
            <v-btn icon small absolute left fab v-on="on" @click="removePersonImmediately">
                <v-icon small color="grey lighten-1">fa-trash-alt</v-icon>
            </v-btn>
        </template>

        <v-card>
            <v-toolbar dark color="primary">

                <v-toolbar-title>Remove Person</v-toolbar-title>

                <v-spacer></v-spacer>

                <v-toolbar-items>
                    <v-btn dark flat @click="removePerson">remove</v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text>
                <v-container grid-list-lg fluid>
                    <v-layout>
                        <v-flex>

                            <v-form ref="form" @submit.prevent="removePerson">

                                <v-select v-if="person.totalPay > 0"
                                          :label="`Assign ${person.name} payments to`"
                                          v-model="alterPayer"
                                          :rules="[rules.required]" validate-on-blur required
                                          class="mb-4" no-data-text="You need to add more person"
                                          :items="otherPeople" item-text="name" item-value="id"
                                ></v-select>

                                <p v-if="person.totalCost > 0">{{person.name}} costs will be shared between all</p>

                                <!--<v-select v-if="0 && person.totalCost > 0"-->
                                          <!--:label="`Assign ${person.name} costs to`"-->
                                          <!--v-model="alterCosts"-->
                                          <!--:rules="[rules.required]" validate-on-blur required-->
                                          <!--:items="[...otherPeople, {id: -1, name: 'No one (share between all)'}]"-->
                                          <!--item-text="name" item-value="id"-->
                                          <!--class="mb-4" no-data-text="You need to add more person"></v-select>-->

                            </v-form>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>

        </v-card>

    </v-dialog>

</template>

<script>

    export default {

        props: {
            person: Object
        },

        data() {
            return {

                dialog: false,

                alterPayer: '',
                alterCosts: '',

                rules: {
                    required: v => !!v || 'Required'
                }
            }
        },

        computed: {
            otherPeople() {
                return this.$store.state._people.filter(p => p.id !== this.person.id)
            }
        },

        methods: {

            removePerson() {

                if (!this.$refs.form.validate())
                    return false

                this.$store.dispatch("removePerson", {
                    id: this.person.id,
                    name: this.person.name,
                    alterPayer: this.alterPayer
                })
                    .then(() => {

                        this.dialog = false
                        this.alterPayer = ''
                        this.alterCosts = ''
                        this.$storage.set('items', this.$store.state._items)
                        this.$storage.set('people', this.$store.state._people)

                    })

                this.$router.push('/receipt')

            },

            removePersonImmediately(){
                if(this.person.totalPay === 0 && this.person.totalCost === 0)
                    this.removePerson()
            }


        },


    }
</script>
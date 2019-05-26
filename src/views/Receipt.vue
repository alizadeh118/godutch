<template>

    <div>

        <v-layout align-center>
            <v-flex>
                <v-text-field label="New person" ref="form" required :value="person" @change="v => person=v"
                              :rules="rules" @keypress.enter="addPerson" class="text-capitalize" validate-on-blur></v-text-field>
            </v-flex>
            <v-flex shrink>
                <v-btn class="primary px-2 mr-0" @click="addPerson" depressed>Add</v-btn>
            </v-flex>
        </v-layout>

        <v-list two-line class="transparent">
            <template v-for="(person,id,index) in people">

                <v-list-tile :key="id" :to="'/receipt/' + id">

                    <v-list-tile-content>

                        <v-list-tile-title>
                            <span class="text-capitalize">{{person.name}}</span>:

                            <b>{{ Math.round(Math.abs(person.debt)) | currency }}</b>

                        </v-list-tile-title>

                        <v-list-tile-sub-title>

                            <span v-show="person.debt > 0" class="red--text">must pay</span>
                            <span v-show="person.debt < 0" class="green--text">must be paid</span>
                            <span v-show="person.debt === 0" class="grey--text text--darken-2">has nothing to do</span>

                        </v-list-tile-sub-title>

                    </v-list-tile-content>

                    <v-list-tile-action>

                        <v-btn icon ripple small :to="'/receipt/' + id">
                            <v-icon small color="grey">fa-info-circle</v-icon>
                        </v-btn>


                        <!--<v-btn icon ripple small @click="removePerson(person)"-->
                        <!--v-if="!$store.getters.getPersonPay(id)">-->
                        <!--<v-icon small color="grey">fa-trash-alt</v-icon>-->
                        <!--</v-btn>-->
                        <!--<v-btn icon ripple small @click="editPerson(person)" v-else>-->
                        <!--<v-icon small color="grey">fa-user-edit</v-icon>-->
                        <!--</v-btn>-->
                    </v-list-tile-action>

                </v-list-tile>

                <v-divider :key="person.name" v-if="index < Object.keys(people).length - 1"></v-divider>
            </template>
        </v-list>

        <p class="copyright">made with <v-icon small color="red lighten-2">fa-heart</v-icon> by <a target="_blank" href="https://alizadeh118.ir/">me</a></p>

        <v-dialog :value="newPerson" max-width="600px">

            <v-card>
                <v-toolbar dark color="primary">

                    <v-toolbar-title>Person Name</v-toolbar-title>

                    <v-spacer></v-spacer>

                    <v-toolbar-items>
                        <v-btn dark flat @click="updatePerson">Save</v-btn>

                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-container grid-list-lg fluid>
                        <v-layout>
                            <v-flex>
                                <v-form ref="updateForm" @submit.prevent="updatePerson">

                                    <v-text-field label="Name" required v-model="newPerson.name" ref="newPerson"
                                                  :rules="rules" @focus="$event.target.select()"
                                                  validate-on-blur></v-text-field>

                                </v-form>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>

            </v-card>

        </v-dialog>

    </div>

</template>

<script>


    export default {

        data() {
            return {

                person: '',
                newPerson: '',
                error: false,
                rules: [
                    v => !!v || 'Required',
                    v => !!v && !this.$store.state._people.some(person => person.name.toLowerCase() === v.toLowerCase()) || 'already exists',
                ],

            }
        },

        computed: {
            people() {
                return this.$store.getters.people
            }
        },
        methods: {

            addPerson() {


                if (!this.$refs.form.validate()) return;

                this.person = this.person.charAt(0).toUpperCase() + this.person.slice(1)

                this.$store.dispatch("addPerson", this.person)
                    .then(() => {

                        this.$storage.set('people', this.$store.state._people)

                        this.$refs.form.reset()
                        this.person = ''

                    })

            },

            removePerson(person) {

                this.$store.dispatch("removePerson", person)
                this.$storage.set('people', this.$store.state._people)

            },

            editPerson(person) {

                this.newPerson = {...person}
                setTimeout(() => this.$refs.newPerson.focus())

            },

            updatePerson() {


                if (!this.$refs.updateForm.validate()) return;

                this.$store.dispatch("updatePerson", this.newPerson)
                    .then(() => {

                        this.newPerson = ''
                        this.$storage.set('people', this.$store.state._people)

                    })

            }

        },


    }
</script>

<style>
    .text-capitalize input {
        text-transform: capitalize;
    }
    .copyright {
        position: absolute;
        text-align: center;
        opacity: .9;
        bottom: 1em;
        margin: 0;
        left:0;
        right:0;
    }
</style>
<template>

    <v-dialog max-width="600px" v-model="dialog">

        <template v-slot:activator={on}>
            <v-btn icon small absolute right fab v-on="on">
                <v-icon small color="grey lighten-1">fa-user-edit</v-icon>
            </v-btn>
        </template>

        <v-card>
            <v-toolbar dark color="primary">

                <v-toolbar-title>Edit Person</v-toolbar-title>

                <v-spacer></v-spacer>

                <v-toolbar-items>
                    <v-btn dark flat @click="updatePerson">save</v-btn>
                </v-toolbar-items>
            </v-toolbar>

            <v-card-text>

                <v-container grid-list-lg fluid>
                    <v-layout>
                        <v-flex>
                            <v-form ref="form" @submit.prevent="updatePerson">

                                <v-text-field label="New Name" required v-model="newName" ref="newName" class="text-capitalize"
                                              :rules="rules"></v-text-field>

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
            personId: Number
        },

        data() {
            return {

                dialog: false,

                newName: '',

                rules: [
                    v => !!v || 'Required',
                    v => !!v && !this.$store.state._people.some(person => person.name.toLowerCase() === v.toLowerCase()) || 'already exists',
                ],
            }
        },


        methods: {

            updatePerson() {

                if (!this.$refs.form.validate()) return;

                this.newName = this.newName.charAt(0).toUpperCase() + this.newName.slice(1)


                this.$store.dispatch("updatePerson", {
                    id: this.personId,
                    name: this.newName
                })
                    .then(() => {

                        this.dialog = false
                        this.newName = ''
                        this.$storage.set('people', this.$store.state._people)

                    })

            }


        },

        watch: {
            dialog(val) {
                this.$refs.form.resetValidation()
                if (val)
                    setTimeout(() => this.$refs.newName.focus())
            }
        }


    }
</script>
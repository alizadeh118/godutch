<template>

    <v-layout fill-height :class="{'align-center justify-center': $store.getters.itemsCount === 0  }">

        <v-flex v-if="$store.getters.itemsCount === 0" shrink class="text-xs-center">

            <v-icon color="grey lighten-2" size="100">fa-folder-open</v-icon>
            <v-subheader>There is no item</v-subheader>

        </v-flex>

        <v-flex v-else>

            <v-list two-line class="transparent">
                <template v-for="item in $store.getters.items">
                    <v-list-tile :key="item.id">

                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{item.title}}:
                                <b>{{item.price | currency}}</b>
                            </v-list-tile-title>
                            <v-list-tile-sub-title>paid by <span class="grey--text text--darken-3">{{$store.getters.people[item.payer].name}}</span>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>

                        <v-list-tile-action>
                            <v-btn icon ripple small @click="editItem(item)">
                                <v-icon small color="grey">fa-edit</v-icon>
                            </v-btn>
                        </v-list-tile-action>

                    </v-list-tile>

                    <v-divider :key="item.id + '' + item.payer"></v-divider>
                </template>
            </v-list>
        </v-flex>

        <v-dialog v-model="dialog" max-width="600px">

            <v-card>
                <v-toolbar dark color="primary">

                    <v-toolbar-title>Update Item</v-toolbar-title>

                    <v-spacer></v-spacer>

                    <v-toolbar-items>
                        <v-btn dark flat @click="updateItem">Save</v-btn>

                    </v-toolbar-items>
                </v-toolbar>

                <v-card-text>
                    <v-container grid-list-lg fluid>
                        <v-layout>
                            <v-flex>

                                <add-form ref="form" :item="newItem"/>

                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>

            </v-card>

        </v-dialog>

    </v-layout>

</template>

<script>

    import addForm from '@/components/addForm.vue'


    export default {

        components: {
            addForm
        },

        data() {
            return {
                newItem: {
                    id: '',
                    title: '',
                    price: '',
                    payer: '',
                    share: ''
                },
                dialog: false
            }
        },

        methods: {

            editItem(item) {

                this.newItem = JSON.parse(JSON.stringify(item))
                this.dialog = true

            },

            updateItem() {

                this.$refs.form.setItem()
                this.dialog = false

            }


        },


    }
</script>
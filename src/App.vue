<template>
    <v-app>

        <v-content>

            <v-toolbar app>
                <v-toolbar-title>GoDutch</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-chip color="blue-grey darken-1" text-color="white" disabled v-show="$store.getters.totalCostPerPerson">
                    PerPerson:
                    <b class="ml-1">{{Math.round($store.getters.totalCostPerPerson) | currency}}</b>
                </v-chip>
                <v-btn icon @click="cleanDialog = true">
                    <v-icon color="grey darken-1">fa-redo-alt</v-icon>
                </v-btn>
            </v-toolbar>

            <v-container fluid fill-height>
                <v-layout fluid fill-height wrap>
                    <v-flex>
                        <transition name="fade" mode="out-in">
                            <router-view/>
                        </transition>
                    </v-flex>
                </v-layout>
            </v-container>

            <v-bottom-nav app :value="true">

                <v-btn color="secondary" flat to="/receipt" exact>
                    <span>Receipt</span>
                    <v-icon>fa-receipt</v-icon>
                </v-btn>

                <v-btn color="secondary" flat to="/add" exact>
                    <span>Add Item</span>
                    <v-icon>fa-plus-circle</v-icon>
                </v-btn>

                <v-btn color="secondary" flat to="/items" exact>
                    <span>Items</span>
                    <v-icon>fa-list</v-icon>
                </v-btn>

            </v-bottom-nav>

            <v-dialog v-model="cleanDialog" max-width="600px">

                <v-card>

                    <v-card-title class="headline red white--text" >
                        Refresh the app
                    </v-card-title>

                    <v-card-text>
                        <p>All the data will be lost<br>Do you want to refresh the app?</p>
                        <v-btn @click="refresh">Yes</v-btn>
                        <v-btn color="primary" @click="cleanDialog = false">No</v-btn>
                    </v-card-text>

                </v-card>

            </v-dialog>

        </v-content>

    </v-app>

</template>


<style>
    #app {
        font-family: 'Roboto', sans-serif;
        /*font-weight: lighter;*/
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    .fade-enter-active, .face-leave-active {
        transition: all 1s;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .flex-column {
        flex-direction: column;
    }

    .position-relative {
        position: relative;
    }

    .position-absolute {
        position: absolute;
    }

    input[readonly] {
        caret-color: transparent !important;
    }
</style>


<script>
    export default {

        data() {
            return {
                cleanDialog: false
            }
        },

        methods: {

            refresh() {
                this.$store.state._items = []
                this.$store.state._people = []
                this.$storage.clear()
                this.cleanDialog = false
                this.$router.push('/receipt')
            }
        },

        created() {

            if (this.$storage.get('items'))
                this.$store.dispatch("setItems", this.$storage.get('items'))

            if (this.$storage.get('people'))
                this.$store.dispatch("setPeople", this.$storage.get('people'))

        }

    }
</script>
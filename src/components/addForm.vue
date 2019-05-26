<template>

    <v-form ref="form">


        <v-text-field label="Title" required v-model="item.title" :rules="[rules.required]" validate-on-blur
                      class="mb-4 text-capitalize"></v-text-field>

        <v-text-field label="Price" required v-model="money" :rules="[rules.required, rules.price]" pattern="\d*"
                      class="mb-4"></v-text-field>

        <v-select label="Payer" v-model="item.payer" required :rules="[rules.required]" validate-on-blur class="mb-4"
                  :items="$store.state._people" item-text="name" item-value="id"
                  no-data-text="You didn't add any person yet"></v-select>

        <v-select label="Share between" v-model="item.share" required :rules="[rules.requiredArray, rules.share]"
                  validate-on-blur
                  class="mb-4" multiple
                  :items="$store.state._people" item-text="name" item-value="id"
                  no-data-text="You didn't add any person yet"></v-select>


    </v-form>

</template>

<script>

    export default {

        props: {
            item: {
                type: Object,
                required: false,
                default() {
                    return {
                        title: '',
                        price: '',
                        payer: '',
                        share: ''
                    }
                }
            }
        },

        data() {
            return {

                rules: {
                    required: v => !!v || 'Required',
                    requiredArray: v => v.length > 0 || 'Required',
                    price: v => /^\d+(,\d+)*$/.test(v) || 'Only Number',
                    share: v => !(v.length === 1 && this.item.payer === v[0]) || 'Choose someone else or add more person'
                }
            }
        },

        methods: {

            setItem() {


                if (!this.$refs.form.validate()) return;

                this.item.title = this.item.title.charAt(0).toUpperCase() + this.item.title.slice(1)

                this.$store.dispatch("addItem", this.item)
                    .then(() => {

                        this.$refs.form.reset()

                        this.item.title = ''
                        this.item.price = ''
                        this.item.payer = this.getMostPayerId()
                        this.item.share = this.getPeopleId()


                        this.$storage.set('items', this.$store.state._items)

                    })

            },


            getMostPayerId() {
                setTimeout(() => {
                    this.item.payer = this.$store.getters.mostPayerId
                    if (!this.item.payer && this.$store.state._people[0])
                        this.item.payer = this.$store.state._people[0].id
                })
                return '';
            },

            getPeopleId() {
                setTimeout(() => this.item.share = this.$store.getters.peopleId)
                return '';
            }

        },

        computed: {
            money: {
                get() {
                    return this.item.price.toString().replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1,")
                },

                set(v) {
                    if (!v)
                        return this.item.price = ''

                    this.item.price = v.replace(/[^\d.]/g, '')
                    if (this.item.price)
                        this.item.price = +this.item.price
                }
            },

        },

        created() {
            this.getMostPayerId()
            this.getPeopleId()
        }


    }
</script>
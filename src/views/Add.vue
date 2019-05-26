<template>

    <div>
        <add-form ref="form" />
        <v-btn class="primary mt-3" block @click="addItem">Add Item</v-btn>
    </div>

</template>

<script>

    import addForm from '@/components/addForm.vue'

    export default {

        components: {
            addForm
        },

        methods: {

            addItem() {

                this.$refs.form.setItem()

            },


        },

        beforeRouteEnter(to, from, next) {

            let people = localStorage.getItem('gd_people')
            if (people) {
                people = JSON.parse(people)
                people = people.value.length
            }

            if (from.path === '/' && !people)
                next('/receipt')
            next()

        },

    }
</script>
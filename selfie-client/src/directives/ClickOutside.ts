export default {
    beforeMount(el: any, binding: any) {
        el.clickOutsideEvent = function (event: any) {
            // Check if click was outside the el and his children
            if (!(el == event.target || el.contains(event.target))) {
                // Call the method
                binding.value();
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el: any) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    },
};
<script>
	import Header from '../components/header.svelte';
	import Footer from '../components/footer.svelte';
	import { onMount } from 'svelte';
</script>

<Header />

<slot/>

<Footer />

<style lang="scss">
</style>

<script>
	import Camera from './components/Camera.svelte'
</script>

<main>
	<Camera />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		display:flex;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
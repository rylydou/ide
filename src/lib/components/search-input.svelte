<script lang="ts">
	export let value = ''
</script>

<label class="search-input" style="flex: 1;">
	<span>
		<div class="icon-search"></div>
	</span>
	<input type="search" bind:value {...$$restProps} />
</label>

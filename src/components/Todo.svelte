<script>
  export let task;

  export let completed = false;
</script>

<p>
  <input type="checkbox" checked={completed} />
  {task}
</p>

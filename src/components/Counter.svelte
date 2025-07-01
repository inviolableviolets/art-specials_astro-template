<script>
  let count = 0;
  let increment = () => {
    count += 1;
  };
  let decrement = () => {
    count -= 1;
  };
</script>

<div>
  <button on:click={decrement}>-</button>
  {count}
  <button on:click={increment}>+</button>
</div>

<style>
  div {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    background-color: black;
    color: white;
    border: none;
    border-radius: 5px;
    text-transform: uppercase;
  }
  button {
    padding: 5px 10px;
    font-size: 16px;
    cursor: pointer;
  }
</style>

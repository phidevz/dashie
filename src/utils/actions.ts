export const createAction = "create";
export const editAction = "edit";
export const deleteAction = "delete";



if(typeof window !== "undefined"){
    addEventListener("submit", function onSubmit(event) {
      if (!event || !event.target) {
        return;
      }
      if ((event.target as HTMLFormElement).id === deleteAction) {
        const proceed = confirm(
          "Are you sure you want to proceed with deletion?"
        );
        if (!proceed) {
          event.preventDefault();
        }
      }
    });
  }
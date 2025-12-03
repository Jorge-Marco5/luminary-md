// alerta nativa de aviso de que si recarga la pagina o vuelve atras los cambios se perderan

export function alertReloadPage() {
  if (typeof window !== "undefined") {
    window.onbeforeunload = function (e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
  }
}

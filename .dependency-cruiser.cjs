// Fronteras del monorepo (DEC-007) como chequeo automático, no como
// disciplina de code review. CI falla si alguna regla se rompe.

module.exports = {
  forbidden: [
    {
      name: "packages-nunca-importan-apps",
      comment: "DEC-007(a): las dependencias van solo de apps/* hacia packages/*",
      severity: "error",
      from: { path: "^packages" },
      to: { path: "^apps" },
    },
    {
      name: "pwa-jamas-importa-api",
      comment: "DEC-007(c): las apps se comunican solo por HTTP",
      severity: "error",
      from: { path: "^apps/pwa" },
      to: { path: "^apps/api" },
    },
    {
      name: "api-jamas-importa-pwa",
      comment: "DEC-007(c): las apps se comunican solo por HTTP",
      severity: "error",
      from: { path: "^apps/api" },
      to: { path: "^apps/pwa" },
    },
    {
      name: "tipos-bd-es-hoja",
      comment: "DEC-007(b): tipos-bd no depende de nada del repo",
      severity: "error",
      from: { path: "^packages/tipos-bd" },
      to: { path: "^(apps|packages/dominio)" },
    },
    {
      name: "dominio-solo-depende-de-tipos-bd",
      comment: "DEC-007(b): dominio solo puede depender de tipos-bd",
      severity: "error",
      from: { path: "^packages/dominio" },
      to: { path: "^apps|^packages/(?!dominio|tipos-bd)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.base.json" },
  },
};

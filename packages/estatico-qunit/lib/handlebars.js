module.exports = (handlebars) => {
  const template = handlebars.compile(`<!-- DO NOT COPY -->
    <div class="sg_tests">
      <div id="qunit"></div>
      <div id="qunit-fixture"></div>

      <script src="{{mainTestScript}}"></script>

      {{#each testScripts}}
        <script src="{{this}}"></script>
      {{/each}}
    </div>
  <!-- //DO NOT COPY -->`);

  return options => template(options.hash);
};

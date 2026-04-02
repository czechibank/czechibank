// Generated from: tests/bdd-tests/features/login.feature
import { test } from "playwright-bdd";

test.describe('Login user', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I am on the login page', null, { page }); 
  });
  
  test('Login user with valid credentials', async ({ When, Then, And, page }) => { 
    await When('I fill username "zachranNas+brno@pejsekAKocicka.cz"', null, { page }); 
    await And('I fill password "PejsekAKocicka123"', null, { page }); 
    await And('I click sign in button', null, { page }); 
    await Then('I am redirected to "Dashboard"', null, { page }); 
    await And('I should see title "[BRNO] Pejsek a Kočička 🐶&🐱"', null, { page }); 
  });

  test('Try to login with invalid password', async ({ When, Then, And, page }) => { 
    await When('I fill username "zachranNas+brno@pejsekAKocicka.cz"', null, { page }); 
    await And('I fill password "spatneheslo"', null, { page }); 
    await And('I click sign in button', null, { page }); 
    await Then('I should see error message "Invalid email or password"', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/bdd-tests/features/login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":7,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I fill username \"zachranNas+brno@pejsekAKocicka.cz\"","stepMatchArguments":[{"group":{"start":16,"value":"\"zachranNas+brno@pejsekAKocicka.cz\"","children":[{"start":17,"value":"zachranNas+brno@pejsekAKocicka.cz","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"And I fill password \"PejsekAKocicka123\"","stepMatchArguments":[{"group":{"start":16,"value":"\"PejsekAKocicka123\"","children":[{"start":17,"value":"PejsekAKocicka123","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"And I click sign in button","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I am redirected to \"Dashboard\"","stepMatchArguments":[{"group":{"start":19,"value":"\"Dashboard\"","children":[{"start":20,"value":"Dashboard","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"And I should see title \"[BRNO] Pejsek a Kočička 🐶&🐱\"","stepMatchArguments":[{"group":{"start":19,"value":"\"[BRNO] Pejsek a Kočička 🐶&🐱\"","children":[{"start":20,"value":"[BRNO] Pejsek a Kočička 🐶&🐱","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":18,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given I am on the login page","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I fill username \"zachranNas+brno@pejsekAKocicka.cz\"","stepMatchArguments":[{"group":{"start":16,"value":"\"zachranNas+brno@pejsekAKocicka.cz\"","children":[{"start":17,"value":"zachranNas+brno@pejsekAKocicka.cz","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"And I fill password \"spatneheslo\"","stepMatchArguments":[{"group":{"start":16,"value":"\"spatneheslo\"","children":[{"start":17,"value":"spatneheslo","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"And I click sign in button","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then I should see error message \"Invalid email or password\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Invalid email or password\"","children":[{"start":28,"value":"Invalid email or password","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end
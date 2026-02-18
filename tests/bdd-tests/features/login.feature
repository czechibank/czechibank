Feature: Login user
  This feature tests login functionality

  Background:
    Given I am on the login page

  Scenario: Login user with valid credentials
    When I fill username "zachranNas+brno@pejsekAKocicka.cz"
    And I fill password "PejsekAKocicka123"
    And I click sign in button
    Then I am redirected to "Dashboard"
    And I should see title "[BRNO] Pejsek a Kočička 🐶&🐱"

  Scenario: Try to login with invalid password
    When I fill username "zachranNas+brno@pejsekAKocicka.cz"
    And I fill password "spatneheslo"
    And I click sign in button
    Then I should see error message "Invalid email or password"

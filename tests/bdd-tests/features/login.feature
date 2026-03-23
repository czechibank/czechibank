Feature: Login user
  This feature tests login functionality

  Background:
    Given I am on the login page

  @smoke @login @happy-path @CZBANK-T5 @general
  Scenario: 001_Login with valid username and password
    When I fill username "zachranNas+brno@pejsekAKocicka.cz"
    And I fill password "PejsekAKocicka123"
    And I click sign in button
    Then I am redirected to "Dashboard"
    And I should see title "[BRNO] Pejsek a Kočička 🐶&🐱"

  @smoke @login @negative @CZBANK-T7 @general
  Scenario Outline: 002_Login with invalid email format
    When I fill username "<email>"
    And I fill password "<password>"
    And I click sign in button
    Then I should see "email" validation text "<emailValidationText>"

    Examples:
      | email                            | password          | emailValidationText |
      | zachranNas+brnopejsekAKocicka.cz | PejsekAKocicka123 | Invalid email       |
      | zachranNas+brno@pejsekAKocicka   | PejsekAKocicka123 | Invalid email       |
      |                                  | PejsekAKocicka123 | Invalid email       |

  @smoke @login @negative @CZBANK-T8 @general
  Scenario: 003_Login with valid email and wrong password
    When I fill username "zachranNas+brno@pejsekAKocicka.cz"
    And I fill password "PejsekAKocicka12"
    And I click sign in button
    Then I should see error message "Invalid email or password"

  @smoke @login @negative @CZBANK-T8 @specific
  Scenario: 003_Try to login without password filled
    When I fill username "zachranNas+brno@pejsekAKocicka.cz"
    And I fill password ""
    And I click sign in button
    Then I should see "password" validation text "Password must be at least 8 characters long"

  @smoke @login @happy-path @CZBANK-T9 @general
  Scenario: 004_Sign out from app
    Given I am logged in as "zachranNas+brno@pejsekAKocicka.cz" with password "PejsekAKocicka123"
    And I click profile button
    And I click sign out button
    Then I am redirected to "SigninPage"

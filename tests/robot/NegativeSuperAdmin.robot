*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem
Library    DateTime
Library    resources/OtpLibrary.py

*** Variables ***
${BROWSER}    chrome
${URL}    http://localhost:5173/
${DELAY}    0
${SCREENSHOT_DIR}    screenshots
${SECRET}    32KZ7QO6I5Q6CGI2K3PJQOOFNMYI46ES

*** Keywords ***
Capture Step Screenshot
    [Arguments]    ${step_name}
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    Capture Page Screenshot    ${SCREENSHOT_DIR}/${step_name}_${timestamp}.png

SignIn-Privatekey
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    Capture Step Screenshot    admin_login_start
    
    # Select Admin Role
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    Click Element    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    Capture Step Screenshot    admin_role_selected
    
    # Input Login Credentials
    Wait Until Element Is Visible    id=email-input
    Input Text    id=email-input    AtitayaAdmin@gmail.com
    Input Password    id=password-input    1234
    Capture Step Screenshot    admin_credentials_entered
    
    # Click Login Button
    Click Element    id=login-submit-btn
    
    # Verify Login Success
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    เข้าสู่ระบบสำเร็จ!
    Capture Step Screenshot    admin_login_success

    Go To    http://localhost:5173/AdminDashboard
    Sleep    2s

    Wait Until Element Is Visible    id=user-menu-btn
    Click Element    id=user-menu-btn

    Wait Until Element Is Visible    id=logout-btn
    Click Element    id=logout-btn

    Wait Until Element Is Visible    id=header-logo-link
    Click Element    id=header-logo-link
    Wait Until Element Is Visible    id=submit-private-key-btn
    Click Element    id=submit-private-key-btn
    Sleep    3s
    Input Text    private-key-input    1111111111111111111111111
    Wait Until Element Is Visible    id=submit-private-key-btn
    Click Element    id=submit-private-key-btn
    Wait Until Element Is Visible    id=verify-otp-btn
    Click Element    id=verify-otp-btn

*** Test Cases ***
TCI01-เข้าสู่ระบบผู้ดูแลระบบขั้นสูงกรณีไม่กรอก Privatekay
    SignIn-Privatekey


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

*** Keywords ***
Capture Step Screenshot
    [Arguments]    ${step_name}
    ${timestamp}=    Get Current Date    result_format=%Y%m%d_%H%M%S
    Capture Page Screenshot    ${SCREENSHOT_DIR}/${step_name}_${timestamp}.png

Login Admin Fail
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    
    
    # Select Admin Role
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    Click Element    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    
    
    # Input Login Credentials
    Input Text    id=email-input    AtitayasAdmin@gmail.com
    Input Password    id=password-input    12345
    Capture Step Screenshot    admin_credentials_entered
    
    # Click Login Button
    Click Element    id=login-submit-btn
    Sleep    3s
    

Login Admin invalid
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window
    
    
    # Select Admin Role
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    Click Element    xpath=//button[contains(@class, 'role-button') and .//span[text()='ผู้ดูแลระบบ']]
    
    
    # Input Login Credentials
    Input Text    id=email-input    AtitayaAdmin@gmail.com    
    
    
    # Click Login Button
    Click Element    id=login-submit-btn
    Sleep    3s
    

Login Admin
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

DashboardAdmin
    Go To    http://localhost:5173/AdminDashboard
    Capture Step Screenshot    admin_dashboard
    Sleep    3s


*** Test Cases ***
TCI001-เข้าสู่ระบบผู้ดูแลระบบกรณีใช้ email ผิด
    Login Admin Fail
    [Teardown]    Close Browser

TCI002-เข้าสู่ระบบผู้ดูแลระบบกรณีกรอกข้อมูลไม่ครบ
    Login Admin invalid
    [Teardown]    Close Browser

TCI003-เพิ่มคอร์สกรณีที่ใส่ข้อมูลคอร์สไม่ครบ
    Login Admin
    DashboardAdmin
    Wait Until Element Is Visible    id=courses-link
    Click Element    id=courses-link

    Wait Until Element Is Visible    id=add-course-btn
    Click Element    id=add-course-btn

    Input Text    id=duration_hours-upload-popup    1
    Input Text    id=max_seats-upload-popup    20
    Input Text    id=start_date-upload-popup    10102025
    Choose File    id=thumbnail-upload-popup    ${CURDIR}/image/download.jpg
    Choose File    id=video-upload-popup        ${CURDIR}/image/12607801_1920_1080_30fps.mp4
    Choose File    id=qr_code-upload-popup      ${CURDIR}/image/download.jpg

    Wait Until Element Is Visible    id=upload-btn-upload-popup
    Click Element    id=upload-btn-upload-popup
    Sleep    5s
    [Teardown]    Close Browser
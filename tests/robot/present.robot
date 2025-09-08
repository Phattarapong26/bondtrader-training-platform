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

*** Test Cases ***
Test Admin Flow
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Speed    ${DELAY}
    Maximize Browser Window

    # Trader Registration
    Click Element    //*[@id="role-btn-trader"]
    Sleep    1s
 
    Click Element    //*[@id="signup-btn"]
    Sleep    3s
    Input Text     //*[@id="name-input"]   อทิตยา ชัยศิริ
    Input Text     //*[@id="company-input"]   Uknowme
    Input Text     //*[@id="citizen-id-input"]    1531231234422
    Input Text     //*[@id="email-input"]    assers13555@gmail.com
    Input Text     //*[@id="phone-input"]    1231231234

    Sleep    1s
    Capture Step Screenshot    trader_register

    Click Element    //*[@id="submit-signup-btn"]
    Sleep    3s
    Capture Step Screenshot    trader_register_verify
    Click Element    css:.swal2-confirm
    Sleep    3s

    # Trader Login
    Input Text    //*[@id="email-input"]    assers13555@gmail.com
    Input Text    //*[@id="password-input"]     1531231234422
    Sleep    1s
    Capture Step Screenshot    trader_login

    Click Element    //*[@id="login-submit-btn"]
    Sleep    3s
    Capture Step Screenshot    after_login
    
    # Verify Login Success
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'swal2-popup')]
    Element Should Contain    xpath=//h2[contains(@class, 'swal2-title')]    เข้าสู่ระบบสำเร็จ!
    Capture Step Screenshot    user_login_success
    Click Element    css:.swal2-confirm
    Sleep    3s

    # Scroll Operations
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)
    Sleep    2s
    Execute JavaScript    window.scrollTo(0, 0)
    Sleep    2s
    
    # Course Slider Operations
    ${slider}=    Get WebElement    //*[@id="main-content"]
    Drag And Drop By Offset    ${slider}    500    0
    Sleep    2s
    Drag And Drop By Offset    ${slider}    -500    0
    Sleep    2s
    
    # Course Selection and Registration
    Click Element   //*[@id="course-card-6729774aed0b44b753cafb4e"]
    Sleep    3s
    Capture Step Screenshot    course_selection
    Click Element     //*[@id="register-course-btn"]
    Sleep    3s

    Capture Step Screenshot    course_registration
    Click Element    css:.swal2-confirm
    Sleep    3s
    Capture Step Screenshot    after_registration
    
    # Learning Flow
    Click Element    //*[@id="start-learning-btn"]
    Sleep    3s
    Capture Step Screenshot    start_learning

    Click Element    css:.swal2-confirm
    Sleep    3s
    Capture Step Screenshot    after_start_learning
    
    # Cancel Enrollment
    Click Element    //*[@id="cancel-enrollment-btn"]
    Sleep    3s
    Capture Step Screenshot    cancel_enrollment
    Click Element    css:.swal2-confirm
    Sleep    3s

    Capture Step Screenshot    after_success
    
    # Wait for SweetAlert2 button to be clickable
    Wait Until Element Is Visible    css:.swal2-confirm
    Execute JavaScript    document.querySelector('.swal2-confirm').click();
    Sleep    3s
    
    # Wait for SweetAlert2 container to disappear
    Wait Until Element Is Not Visible    css:.swal2-container
    Sleep    3s

    Click Element     //*[@id="register-course-btn"]
    Sleep    3s
    Capture Step Screenshot    course_registration
    Click Element    css:.swal2-confirm
    Sleep    3s
    
    # Schedule Navigation
    Click Element    //*[@id="user-nav-schedule"]
    Sleep    3s
    Capture Step Screenshot    schedule
    Click Element    //*[@id="start-course-btn-0"]
    Sleep    3s
    Capture Step Screenshot    start_course
    Click Element    css:.swal2-confirm
    Sleep    3s

    Click Element    css:#user-menu-btn
    Sleep    3s
    Capture Step Screenshot    user_section
    Click Element    //*[@id="profile-btn"]
    Sleep    3s
    Capture Step Screenshot    profile
    Click Element    //*[@id="my-courses-link"]
    Sleep    3s
    Capture Step Screenshot    my_courses
    Click Element    //*[@id="close-history-btn"]
    Sleep    2s
    
    # Change Password
    Click Element    //*[@id="user-section"]
    Sleep    3s
    Capture Step Screenshot    before_password_change
    Click Element    //*[@id="change-password-btn"]
    Input Text    //*[@id="swal-old-password"]     1531231234422
    Input Text    //*[@id="swal-new-password"]    0966566414
    Sleep    1s
    Capture Step Screenshot    password_change

    Click Element    css:.swal2-confirm
    Sleep    5s
    
    # Wait for SweetAlert2 button to be clickable
    Wait Until Element Is Visible    css:.swal2-confirm
    Execute JavaScript    document.querySelector('.swal2-confirm').click();
    Sleep    3s
    
    # Wait for SweetAlert2 container to disappear
    Wait Until Element Is Not Visible    css:.swal2-container
    Sleep    3s
    
    Capture Step Screenshot    after_password_change
    
    # Click logout button
    Click Element    //*[@id="logout-btn"]
    Sleep    5s
    Capture Step Screenshot    logout
    
    # Close browser
    Close Browser

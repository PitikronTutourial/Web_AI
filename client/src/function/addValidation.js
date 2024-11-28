import _ from "lodash";

function addValidation(values) {
    let errors = {};

    if (_.isEmpty(values.firstName)) {
        errors.firstName = "First name should not be empty";
    } else {
        errors.firstName = "";
    }

    if (_.isEmpty(values.lastName)) {
        errors.lastName = "Last name should not be empty";
    } else {
        errors.lastName = "";
    }

    if (_.isEmpty(values.studentId)) {
        errors.studentId = "Student ID should not be empty";
    } else {
        errors.studentId = "";
    }

    if (_.isEmpty(values.birthDate)) {
        errors.birthDate = "Birth date should not be empty";
    } else {
        errors.birthDate = "";
    }

    if (_.isEmpty(values.gender)) {
        errors.gender = "Gender should not be empty";
    } else {
        errors.gender = "";
    }

    if (!values.pic) {
        errors.pic = "Picture should not be empty";
    } else {
        errors.pic = "";
    }

    return errors;
}

export default addValidation;

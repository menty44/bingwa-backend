// import {Users} from '../models';
import {Users} from '../models';

module.exports = function() {
    Users.validatesUniquenessOf('email', {message: 'email is not unique'});
};
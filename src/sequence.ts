import {MiddlewareSequence, RequestContext} from '@loopback/rest';

import {
    AuthenticateFn,
    AuthenticationBindings,
    AUTHENTICATION_STRATEGY_NOT_FOUND,
    USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {inject} from "@loopback/core";

// export class MySequence extends MiddlewareSequence {}
export class MySequence implements MiddlewareSequence {
    constructor(
        // ---- ADD THIS LINE ------
        @inject(AuthenticationBindings.AUTH_ACTION)
        protected authenticateRequest: AuthenticateFn,
    ) {}
    async handle(context: RequestContext) {
        try {
            const {request, response} = context;
            const route = this.findRoute(request);
            // - enable jwt auth -
            // call authentication action
            // ---------- ADD THIS LINE -------------
            await this.authenticateRequest(request);
            const args = await this.parseParams(request, route);
            const result = await this.invoke(route, args);
            this.send(response, result);
        } catch (err) {
            // ---------- ADD THIS SNIPPET -------------
            // if error is coming from the JWT authentication extension
            // make the statusCode 401
            if (
                err.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
                err.code === USER_PROFILE_NOT_FOUND
            ) {
                Object.assign(err, {statusCode: 401 /* Unauthorized */});
            }
            // ---------- END OF SNIPPET -------------
            this.reject(context, err);
        }
    }
}

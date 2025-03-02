/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import { UserProfileRequest } from './user-profile-request';

/**
 *
 * @export
 * @interface PatchedUserRequest
 */
export interface PatchedUserRequest {
  /**
   *
   * @type {string}
   * @memberof PatchedUserRequest
   */
  email?: string;
  /**
   *
   * @type {string}
   * @memberof PatchedUserRequest
   */
  first_name?: string;
  /**
   *
   * @type {string}
   * @memberof PatchedUserRequest
   */
  last_name?: string;
  /**
   *
   * @type {UserProfileRequest}
   * @memberof PatchedUserRequest
   */
  profile?: UserProfileRequest;
}

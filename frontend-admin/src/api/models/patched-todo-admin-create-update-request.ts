/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 0.1.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

// May contain unused imports in some cases
// @ts-ignore
import { StatusEnum } from './status-enum';

/**
 *
 * @export
 * @interface PatchedTodoAdminCreateUpdateRequest
 */
export interface PatchedTodoAdminCreateUpdateRequest {
  /**
   *
   * @type {Array<number>}
   * @memberof PatchedTodoAdminCreateUpdateRequest
   */
  assignees?: Array<number>;
  /**
   *
   * @type {string}
   * @memberof PatchedTodoAdminCreateUpdateRequest
   */
  description?: string;
  /**
   *
   * @type {StatusEnum}
   * @memberof PatchedTodoAdminCreateUpdateRequest
   */
  status?: StatusEnum;
}
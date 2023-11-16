import React from "react";
import Layout from "../../layouts/layout";
import { Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

function Roles() {
    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen xl:p-12 p-6 px-5 xl:px-32 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            to="/users"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Quản lý người dùng
                                        </Link>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <span class="ml-1 text-sm font-medium text-[#17506B] md:ml-2">
                                            <div>Tạo mới quyền</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-6">Tạo mới quyền</div>
                    {/* Main content */}
                    <div>
                        <Formik
                            initialValues={{
                                roles: [],
                            }}
                            onSubmit={async (values) => {
                                alert(JSON.stringify(values, null, 2));
                            }}
                        >
                            {({ values }) => (
                                <Form className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-xl">
                                    <div>Nhập tên quyền:</div>
                                    <label>
                                        <Field type="checkbox" name="toggle" />
                                        {`${values.toggle}`}
                                    </label>

                                    <div id="checkbox-group">Checked</div>
                                    <div
                                        role="group"
                                        aria-labelledby="checkbox-group"
                                        className=""
                                    >
                                        <Field
                                            type="checkbox"
                                            name="roles"
                                            value="Three"
                                        />
                                        <Field name="roles">
                                            {({ field }) => (
                                                <Checkbox
                                                    id="roles"
                                                    name="roles"
                                                    colorScheme="blue"
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "One",
                                                            e.target.checked
                                                        )
                                                    }
                                                >
                                                    Tạo người dùng
                                                </Checkbox>
                                            )}
                                        </Field>
                                        <Checkbox
                                            size="lg"
                                            
                                            type="checkbox"
                                            name="checked"
                                            value="One"
                                        >
                                            Tạo người dùng
                                        </Checkbox>
                                        <label>
                                            <Field
                                                type="checkbox"
                                                name="roles"
                                                value="users.update"
                                            />
                                            Sửa thông tin người dùng
                                        </label>
                                        <label>
                                            <Field
                                                type="checkbox"
                                                name="checked"
                                                value="Three"
                                            />
                                            Xóa người dùng
                                        </label>
                                        <label>
                                            <Field
                                                type="checkbox"
                                                name="checked"
                                                value="users.update"
                                            />
                                            Xóa người dùng
                                        </label>
                                    </div>

                                    <button type="submit">Submit</button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Roles;

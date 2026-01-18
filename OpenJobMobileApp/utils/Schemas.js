import * as Yup from 'yup';

export const PostJobSchema=Yup.object().shape({
    name: Yup.string().required("Vui lòng nhập tiêu đề!"),
    description: Yup.string().required("Vui lòng nhập mô tả!"),
    category_ids: Yup.array().min(1, "Vui lòng chọn ít nhất một danh mục!").required("Vui lòng chọn danh mục!"),
    skills: Yup.string().required("Vui lòng nhập các kỹ năng yêu cầu!"),
    min_salary: Yup.number()
        .transform((value, originalValue) => originalValue === "" ? undefined : value)
        .typeError("Lương phải là số")
        .required("Nhập lương tối thiểu")
        .min(0, "Lương không được âm"),
    max_salary: Yup.number()
        .transform((value, originalValue) => originalValue === "" ? undefined : value)
        .typeError("Lương phải là số")
        .required("Nhập lương tối đa")
        .moreThan(Yup.ref('min_salary'), "Lương tối đa phải lớn hơn lương tối thiểu"),
    location: Yup.string().required("Vui lòng nhập địa chỉ!"),
    map_url: Yup.string().url("Link Google Map không hợp lệ").required("Vui lòng nhập link bản đồ!"),
    deadline: Yup.string().required("Vui lòng chọn hạn nộp!"),
    working_time_ids: Yup.array().min(1, "Vui lòng chọn ít nhất một ca làm việc!")
        .required("Vui lòng chọn thời gian làm việc!"),
});

export const LoginSchema = Yup.object().shape({
    username: Yup.string()
        .required('Vui lòng nhập tên đăng nhập'),
    password: Yup.string()
        .min(4, 'Mật khẩu phải ít nhất 4 ký tự')
        .required('Vui lòng nhập mật khẩu'),
});

export const RegisterSchema = Yup.object().shape({
    first_name: Yup.string().required('Yêu cầu nhập tên'),
    last_name: Yup.string().required('Yêu cầu nhập họ'),
    username: Yup.string().min(3, 'Tên đăng nhập quá ngắn').required('Yêu cầu nhập username'),
    email: Yup.string().email('Email sai định dạng').required('Yêu cầu nhập email'),
    password: Yup.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').required('Yêu cầu nhập mật khẩu'),
    confirm_password: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
        .required('Xác nhận mật khẩu là bắt buộc'),
    phone_number: Yup.string().required('Yêu cầu số điện thoại'),
    
  
    company_name: Yup.string().when('role', {
        is: 'employer',
        then: () => Yup.string().required('Cần nhập tên công ty')
    }),
    tax_code: Yup.string().when('role', {
        is: 'employer',
        then: () => Yup.string().required('Cần nhập mã số thuế')
    }),
    address: Yup.string().when('role', {
        is: 'employer',
        then: () => Yup.string().required('Cần nhập địa chỉ công ty')
    })
});
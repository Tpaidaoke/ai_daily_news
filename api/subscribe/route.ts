import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  console.log(email);

  const resend = new Resend(process.env.RESEND_API_KEY);
  //创建账户
  const { error: createError } = await resend.contacts.create({
    email: email,
  });
  // 如果报错返回错误信息
  if (createError) {
    return NextResponse.json(
      { message: createError.message },
      {
        status: 500,
      }
    );
  }

  // 添加账户
  const { error: addError } = await resend.contacts.segments.add({
    email: email,
    segmentId: process.env.RESEND_SEGMENT_ID || "",
  });
  // 如果报错返回错误信息
  if (addError) {
    return NextResponse.json(
      { message: addError.message },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({ message: "订阅成功" }, { status: 200 });
}

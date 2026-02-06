import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();
  console.log(email);

  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // 创建或获取联系人
    const { error: createError } = await resend.contacts.create({
      email: email,
    });

    // 忽略联系人已存在的错误
    if (createError && !createError.message.includes("Contact already exists")) {
      return NextResponse.json(
        { message: createError.message },
        { status: 500 }
      );
    }

    // 添加到订阅群组
    const segmentId = process.env.RESEND_SEGMENT_ID;
    if (segmentId) {
      const { error: addError } = await resend.contacts.segments.add({
        email: email,
        segmentId: segmentId,
      });

      // 忽略联系人已存在群组的错误
      if (addError && !addError.message.includes("Contact already exists")) {
        return NextResponse.json(
          { message: addError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "订阅成功" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "订阅失败" },
      { status: 500 }
    );
  }
}

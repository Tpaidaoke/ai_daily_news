import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ message: "邮箱不能为空" }, { status: 400 });
    }

    console.log("Subscribe request:", email);

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
      return NextResponse.json({ message: "服务器配置错误" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // 创建联系人
    const { error: createError } = await resend.contacts.create({
      email: email,
    });

    // 忽略联系人已存在的错误
    if (createError && createError.message !== "Contact already exists") {
      console.error("Create contact error:", createError);
      return NextResponse.json(
        { message: createError.message || "创建联系人失败" },
        { status: 500 }
      );
    }

    // 添加到订阅群组（如果配置了）
    const segmentId = process.env.RESEND_SEGMENT_ID;
    if (segmentId) {
      try {
        const { error: addError } = await resend.contacts.segments.add({
          email: email,
          segmentId: segmentId,
        });

        if (addError && addError.message !== "Contact already exists") {
          console.error("Add to segment error:", addError);
        }
      } catch (segmentError) {
        console.error("Segment error:", segmentError);
      }
    }

    return NextResponse.json({ message: "订阅成功" }, { status: 200 });
  } catch (error: any) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { message: error.message || "订阅失败" },
      { status: 500 }
    );
  }
}

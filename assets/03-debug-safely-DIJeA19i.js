var e={id:`debug-safely`,h:{en:`Debugging safely and conditional debugs`,hi:`Safely debug karna aur conditional debugs`},body:{en:`
<p>A debug is like switching on a microphone in every room of a busy office and piping all of it to one speaker. You will hear the conversation you wanted, but also everything else, and the person typing the transcript (the router CPU) may collapse. A <b>conditional debug</b> is the same microphone, but only in one meeting room.</p>

<h3>Why debugs are dangerous</h3>
<p>A <code>debug</code> command tells IOS to generate a log message for every event of a certain kind: every OSPF hello, every NAT translation, every packet. Generating and printing these messages is done by the <b>CPU</b>. On a busy router this can raise CPU usage sharply, delay routing protocol hellos so neighbours drop, and in the worst case leave you unable to type <code>undebug all</code> on the console. Debug messages are logged at severity <b>7 (debugging)</b>, so where they appear depends entirely on your logging configuration.</p>

<h3>Prepare the router before you debug</h3>
<pre class="code">R1(config)# service timestamps debug datetime msec localtime  <span class="c">! exact timing</span>
R1(config)# no logging console                  <span class="c">! the console is slow (9600 baud)</span>
R1(config)# logging buffered 64000 debugging    <span class="c">! keep output in RAM</span>
R1(config)# end
R1# show processes cpu sorted | include CPU      <span class="c">! baseline before starting</span>
R1# terminal monitor                            <span class="c">! only if you want output on SSH</span></pre>
<ul>
<li><b>Console logging</b> is the most dangerous destination, because every message is written at serial speed while the CPU waits.</li>
<li><b>Buffered logging</b> stores messages in RAM; read them with <code>show logging</code>. It is the safest place for debug output.</li>
<li><b>terminal monitor</b> copies log messages to your own SSH or Telnet session. It is per session and is lost when you disconnect; <code>terminal no monitor</code> stops it.</li>
</ul>

<h3>Run, read and stop</h3>
<pre class="code">R1# debug ip ospf adj
R1# show debugging                  <span class="c">! which debugs are on right now</span>
R1# show logging | include OSPF
R1# undebug all                     <span class="c">! same as "no debug all"; "u all" is the short form</span></pre>
<p>Make stopping easy before you start: type <code>undebug all</code> into a second SSH session and leave it ready. For packet debugs, always use an ACL so only matching packets are reported:</p>
<pre class="code">R1(config)# access-list 150 permit icmp host 192.168.50.10 host 198.51.100.10
R1# debug ip packet 150 detail</pre>
<p>Remember that <code>debug ip packet</code> only shows packets that the CPU handles (process-switched, punted, or sent and received by the router itself). With CEF, transit traffic is switched in the data plane and never appears. If you need to see transit traffic, use a SPAN capture or Embedded Packet Capture instead.</p>

<h3>Conditional debugging</h3>
<p>Conditional debugs attach a <b>condition</b> to condition-aware debugs. Messages are printed only when they relate to the matching interface, IP address or other attribute. The most common conditions are <code>debug condition interface</code> and <code>debug condition ip</code>.</p>
<pre class="code">R1# debug condition interface GigabitEthernet0/1
Condition 1 set
R1# debug condition ip 10.0.1.1
Condition 2 set
R1# debug ip ospf hello             <span class="c">! now only output linked to the conditions</span>
R1# show debug condition</pre>
<pre class="out">Condition 1: <span class="hl">interface Gi0/1 (1 flags triggered)</span>
        Flags: Gi0/1
Condition 2: ip 10.0.1.1 (0 flags triggered)</pre>
<p>Remove conditions with <code>no debug condition 1</code> or <code>no debug condition all</code>. Here is the safety trap: when you remove the <b>last</b> condition while debugs are still enabled, the filter disappears and the debug suddenly applies to everything. IOS warns you:</p>
<pre class="out">R1# no debug condition all
This condition is the last interface condition set.
Removing all conditions may cause a flood of debugging
messages to result, unless specific debugging flags
are first removed.
Proceed with removal? [yes/no]: <span class="hl">no</span></pre>
<p>The safe order is always: <b>undebug all first, conditions second</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Conditional debug filter">
<rect x="20" y="30" width="150" height="140" rx="10" fill="#fed7aa"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">Events on R1</text>
<text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 hellos</text><text x="95" y="112" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 hellos</text><text x="95" y="134" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 hellos</text>
<rect x="245" y="65" width="150" height="70" rx="10" fill="#fde68a"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Condition filter</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">interface Gi0/1</text>
<rect x="470" y="65" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Log buffer</text><text x="545" y="116" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 only</text>
<line x1="170" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><line x1="395" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Remove the debug first, then the condition</text>
</svg><p class="cap">A condition filters the output of condition-aware debugs to one interface or address.</p></div>

<div class="eg"><p><b>Worked example.</b> A distribution router has 48 OSPF neighbours. One neighbour on Gi0/1 flaps. <code>debug ip ospf hello</code> alone would print about 48 messages every 10 seconds per direction, roughly 10 messages a second. With <code>debug condition interface GigabitEthernet0/1</code> the output drops to one neighbour, about one message every 5 seconds, and the mismatch ("Mismatched hello parameters from 10.0.1.1, Dead R 40 C 120") stands out immediately.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving <code>terminal monitor</code> and a debug running, closing the laptop, and going home. The debug keeps running (and eating CPU) even though nobody reads it. Always finish with <code>undebug all</code> and check <code>show debugging</code> is empty.</p></div>

<div class="exam"><p><b>Exam trap.</b> Debug output is severity 7. If <code>logging buffered</code> is set to a lower level such as <code>informational</code> (6), debug messages will not appear in the buffer. And <code>terminal monitor</code> affects only the current VTY session, not the console.</p></div>

<div class="scn"><h4>The debug that took down a data centre edge</h4><p>An engineer investigating NAT on a busy internet router typed <code>debug ip nat</code> while connected on the console. The router was translating thousands of flows a second. CPU jumped to 99%, BGP keepalives were delayed, the eBGP session to the ISP dropped, and the site lost internet access. A colleague had to power-cycle the router. The post-incident rule became: console logging off, buffered logging on, an ACL or condition on every debug, and <code>undebug all</code> pre-typed in a second session.</p><p><b>Lesson:</b> the danger of a debug grows with traffic volume; narrow it before you start.</p></div>

<div class="iv"><p class="q">"How do you run a debug safely on a production router?"</p><p>Check CPU first; disable console logging and log to the buffer at debugging level; add millisecond timestamps; limit the debug with an ACL or a conditional debug on one interface or IP; keep <code>undebug all</code> ready in a second session; read output with <code>show logging</code>; stop as soon as you have the answer and verify with <code>show debugging</code>. Mention that CEF-switched traffic is not visible to <code>debug ip packet</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Debugs run on the CPU and log at severity 7; they can overload a busy device.</li>
<li>Prepare: <code>no logging console</code>, <code>logging buffered ... debugging</code>, msec timestamps, <code>terminal monitor</code> only for SSH.</li>
<li>Stop with <code>undebug all</code> and confirm with <code>show debugging</code>.</li>
<li><code>debug condition interface</code> and <code>debug condition ip</code> filter condition-aware debugs; check with <code>show debug condition</code>.</li>
<li>Remove the debug before removing the last condition, or the output floods.</li>
</ul></div>
`,hi:`
<p>Debug aisa hai jaise ek busy office ke har kamre mein microphone chalu karke sab kuch ek hi speaker par bajana. Aapko jo baat sunni thi woh sunai degi, par saath mein baaki sab bhi, aur jo transcript type kar raha hai (router ka CPU) woh gir sakta hai. <b>Conditional debug</b> wahi microphone hai, par sirf ek meeting room mein.</p>

<h3>Debugs khatarnak kyun hain</h3>
<p>Ek <code>debug</code> command IOS ko kehta hai ki kisi ek tarah ke har event ke liye log message banao: har OSPF hello, har NAT translation, har packet. Yeh messages banana aur print karna <b>CPU</b> karta hai. Busy router par isse CPU usage tezi se badh sakta hai, routing protocol hellos late ho sakte hain jisse neighbours drop hon, aur sabse bure case mein aap console par <code>undebug all</code> bhi type nahi kar paate. Debug messages severity <b>7 (debugging)</b> par log hote hain, isliye woh kahan dikhenge yeh poori tarah aapki logging configuration par depend karta hai.</p>

<h3>Debug se pehle router tayyar karo</h3>
<pre class="code">R1(config)# service timestamps debug datetime msec localtime  <span class="c">! exact timing</span>
R1(config)# no logging console                  <span class="c">! console dheema hai (9600 baud)</span>
R1(config)# logging buffered 64000 debugging    <span class="c">! output RAM mein rakho</span>
R1(config)# end
R1# show processes cpu sorted | include CPU      <span class="c">! shuru karne se pehle baseline</span>
R1# terminal monitor                            <span class="c">! sirf tab jab SSH par output chahiye</span></pre>
<ul>
<li><b>Console logging</b> sabse khatarnak destination hai, kyunki har message serial speed par likha jaata hai aur CPU wait karta hai.</li>
<li><b>Buffered logging</b> messages RAM mein store karta hai; unhe <code>show logging</code> se padho. Debug output ke liye yeh sabse safe jagah hai.</li>
<li><b>terminal monitor</b> log messages ko aapke apne SSH ya Telnet session par copy karta hai. Yeh per session hai aur disconnect par chala jaata hai; <code>terminal no monitor</code> ise band karta hai.</li>
</ul>

<h3>Chalao, padho aur roko</h3>
<pre class="code">R1# debug ip ospf adj
R1# show debugging                  <span class="c">! abhi kaunse debugs on hain</span>
R1# show logging | include OSPF
R1# undebug all                     <span class="c">! "no debug all" jaisa hi; "u all" short form hai</span></pre>
<p>Shuru karne se pehle rokna aasaan bana lo: doosre SSH session mein <code>undebug all</code> type karke ready chhod do. Packet debugs ke liye hamesha ACL use karo taaki sirf matching packets report hon:</p>
<pre class="code">R1(config)# access-list 150 permit icmp host 192.168.50.10 host 198.51.100.10
R1# debug ip packet 150 detail</pre>
<p>Yaad rakho ki <code>debug ip packet</code> sirf woh packets dikhata hai jo CPU handle karta hai (process-switched, punted, ya router khud jo bhejta aur receive karta hai). CEF ke saath transit traffic data plane mein switch hota hai aur kabhi dikhta hi nahi. Agar transit traffic dekhna hai, to iski jagah SPAN capture ya Embedded Packet Capture use karo.</p>

<h3>Conditional debugging</h3>
<p>Conditional debugs condition-aware debugs par ek <b>condition</b> lagate hain. Messages sirf tab print hote hain jab woh matching interface, IP address ya kisi aur attribute se jude hon. Sabse common conditions <code>debug condition interface</code> aur <code>debug condition ip</code> hain.</p>
<pre class="code">R1# debug condition interface GigabitEthernet0/1
Condition 1 set
R1# debug condition ip 10.0.1.1
Condition 2 set
R1# debug ip ospf hello             <span class="c">! ab sirf conditions se juda output</span>
R1# show debug condition</pre>
<pre class="out">Condition 1: <span class="hl">interface Gi0/1 (1 flags triggered)</span>
        Flags: Gi0/1
Condition 2: ip 10.0.1.1 (0 flags triggered)</pre>
<p>Conditions <code>no debug condition 1</code> ya <code>no debug condition all</code> se hatao. Yahan safety trap hai: jab debugs abhi bhi enabled hon aur aap <b>aakhri</b> condition hata do, to filter gayab ho jaata hai aur debug achanak sab par lagu ho jaata hai. IOS aapko warn karta hai:</p>
<pre class="out">R1# no debug condition all
This condition is the last interface condition set.
Removing all conditions may cause a flood of debugging
messages to result, unless specific debugging flags
are first removed.
Proceed with removal? [yes/no]: <span class="hl">no</span></pre>
<p>Safe order hamesha yahi hai: <b>pehle undebug all, phir conditions</b>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Conditional debug filter">
<rect x="20" y="30" width="150" height="140" rx="10" fill="#fed7aa"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1 par events</text>
<text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 hellos</text><text x="95" y="112" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 hellos</text><text x="95" y="134" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2 hellos</text>
<rect x="245" y="65" width="150" height="70" rx="10" fill="#fde68a"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Condition filter</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">interface Gi0/1</text>
<rect x="470" y="65" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Log buffer</text><text x="545" y="116" text-anchor="middle" class="svg-muted" font-size="12">sirf Gi0/1</text>
<line x1="170" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><line x1="395" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Pehle debug hatao, phir condition</text>
</svg><p class="cap">Condition, condition-aware debugs ke output ko ek interface ya address tak filter karti hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek distribution router ke 48 OSPF neighbours hain. Gi0/1 wala ek neighbour flap kar raha hai. Akele <code>debug ip ospf hello</code> har 10 second mein har direction mein lagbhag 48 messages print karega, yaani lagbhag 10 messages per second. <code>debug condition interface GigabitEthernet0/1</code> ke saath output ek neighbour tak gir jaata hai, lagbhag har 5 second mein ek message, aur mismatch ("Mismatched hello parameters from 10.0.1.1, Dead R 40 C 120") turant saamne aa jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>terminal monitor</code> aur ek debug chalta chhodkar laptop band karke ghar chale jaana. Debug chalta rehta hai (aur CPU khaata rehta hai) bhale hi koi padh na raha ho. Hamesha <code>undebug all</code> se khatam karo aur check karo ki <code>show debugging</code> khaali hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Debug output severity 7 hai. Agar <code>logging buffered</code> kisi neeche level jaise <code>informational</code> (6) par set hai, to debug messages buffer mein nahi dikhenge. Aur <code>terminal monitor</code> sirf current VTY session par asar karta hai, console par nahi.</p></div>

<div class="scn"><h4>Woh debug jisne data centre edge gira diya</h4><p>Ek busy internet router par NAT investigate karte hue ek engineer ne console se connected rehkar <code>debug ip nat</code> type kiya. Router har second hazaaron flows translate kar raha tha. CPU 99% tak pahuncha, BGP keepalives late hue, ISP ke saath eBGP session drop hua, aur site ka internet chala gaya. Ek colleague ko router power-cycle karna pada. Incident ke baad rule bana: console logging off, buffered logging on, har debug par ACL ya condition, aur doosre session mein <code>undebug all</code> pehle se type kiya hua.</p><p><b>Seekh:</b> debug ka khatra traffic volume ke saath badhta hai; shuru karne se pehle use narrow karo.</p></div>

<div class="iv"><p class="q">"Production router par debug safely kaise chalate ho?"</p><p>Pehle CPU check karo; console logging disable karo aur debugging level par buffer mein log karo; millisecond timestamps jodo; debug ko ACL ya ek interface ya IP par conditional debug se simit karo; doosre session mein <code>undebug all</code> ready rakho; output <code>show logging</code> se padho; jawab milte hi roko aur <code>show debugging</code> se verify karo. Batao ki CEF-switched traffic <code>debug ip packet</code> ko nahi dikhta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Debugs CPU par chalte hain aur severity 7 par log hote hain; yeh busy device ko overload kar sakte hain.</li>
<li>Tayyari: <code>no logging console</code>, <code>logging buffered ... debugging</code>, msec timestamps, <code>terminal monitor</code> sirf SSH ke liye.</li>
<li><code>undebug all</code> se roko aur <code>show debugging</code> se confirm karo.</li>
<li><code>debug condition interface</code> aur <code>debug condition ip</code> condition-aware debugs ko filter karte hain; <code>show debug condition</code> se check karo.</li>
<li>Aakhri condition hatane se pehle debug hatao, warna output ki baadh aa jaati hai.</li>
</ul></div>
`}};export{e as default};
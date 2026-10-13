var e={id:`why`,h:{en:`What you will learn, and why multicast and QoS matter`,hi:`Aap kya seekhoge, aur multicast aur QoS kyun matter karte hain`},body:{en:`
<p><b>What you will learn in this module.</b> This is the free starter module of the Multicast and QoS track. By the end you will know, in plain words, how one sender can reach thousands of receivers without flooding the network (multicast), and how a network decides which packets go first when a link is too busy (QoS, short for Quality of Service). You will also build a working multicast stream and mark your first voice packets in the simulator. <b>Prerequisites:</b> you only need to know what an IP address, a subnet mask and a router are. Nothing else. Every new word is explained the first time it appears.</p>

<h3>Three everyday stories</h3>
<p>These three situations are the reason the whole track exists. Keep them in mind; we will come back to each one.</p>
<ul>
<li><b>The live class.</b> Sahyadri University streams a 90-minute lecture from its Pune studio to 40 classrooms. If the studio sent a separate copy to every classroom, the studio link would carry 40 copies of the same video. With multicast it sends one copy, and the network makes extra copies only where the path splits.</li>
<li><b>The IPTV channel.</b> Deccan Broadcast sends a news channel to 50,000 set-top boxes. Unicast would need 50,000 streams. Multicast needs one stream per channel, however many people watch.</li>
<li><b>The voice call on a busy link.</b> A Nashik depot has a 10 Mbps line to head office. At 6 pm the whole depot starts a file backup, the line fills up, and the phone call sounds like a robot. QoS lets the router say: voice goes first, backups can wait.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multicast and QoS in one picture">
<rect x="10" y="10" width="300" height="210" rx="10" fill="#e2e8f0"/>
<text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Multicast: one sender, many receivers</text>
<rect x="30" y="100" width="70" height="40" rx="8" fill="#fde68a"/><text x="65" y="125" text-anchor="middle" class="svg-ink" font-size="12">Studio</text>
<rect x="135" y="100" width="50" height="40" rx="8" fill="#bae6fd"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="12">R</text>
<rect x="230" y="55" width="65" height="34" rx="8" fill="#bbf7d0"/><text x="262" y="77" text-anchor="middle" class="svg-ink" font-size="12">Class A</text>
<rect x="230" y="105" width="65" height="34" rx="8" fill="#bbf7d0"/><text x="262" y="127" text-anchor="middle" class="svg-ink" font-size="12">Class B</text>
<rect x="230" y="155" width="65" height="34" rx="8" fill="#bbf7d0"/><text x="262" y="177" text-anchor="middle" class="svg-ink" font-size="12">Class C</text>
<line x1="100" y1="120" x2="135" y2="120" stroke="#64748b" stroke-width="3"/>
<line x1="185" y1="115" x2="230" y2="72" stroke="#64748b" stroke-width="2"/><line x1="185" y1="120" x2="230" y2="122" stroke="#64748b" stroke-width="2"/><line x1="185" y1="125" x2="230" y2="172" stroke="#64748b" stroke-width="2"/>
<text x="160" y="210" text-anchor="middle" class="svg-muted" font-size="12">1 copy in, copies only where paths split</text>
<rect x="330" y="10" width="300" height="210" rx="10" fill="#e2e8f0"/>
<text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">QoS: who goes first on a busy link</text>
<rect x="345" y="60" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="375" y="80" text-anchor="middle" class="svg-ink" font-size="12">Voice</text>
<rect x="345" y="100" width="60" height="30" rx="6" fill="#ddd6fe"/><text x="375" y="120" text-anchor="middle" class="svg-ink" font-size="12">Video</text>
<rect x="345" y="140" width="60" height="30" rx="6" fill="#fed7aa"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="12">Backup</text>
<rect x="450" y="60" width="50" height="110" rx="8" fill="#bae6fd"/><text x="475" y="120" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<line x1="405" y1="75" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><line x1="405" y1="155" x2="450" y2="145" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="115" x2="600" y2="115" stroke="#64748b" stroke-width="6"/>
<text x="550" y="105" text-anchor="middle" class="svg-muted" font-size="12">narrow link</text>
<text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">voice first, backup waits</text>
</svg><p class="cap">Multicast saves bandwidth by sending less. QoS protects important traffic by deciding the order.</p></div>

<h3>Why these two topics belong together</h3>
<p>Multicast and QoS solve two different problems, but they meet in real networks. A live class is multicast traffic and it is also delay-sensitive, so it needs QoS. A voice call is unicast, but its quality depends on QoS. Engineers who run IPTV, video conferencing, stock-price feeds or large voice networks need both skills, and interviews for network roles often ask about both.</p>

<div class="eg"><p><b>Worked example, the cost of not using multicast.</b> A lecture stream is 4 Mbps. Forty classrooms with unicast means 40 x 4 = 160 Mbps leaving the studio. With multicast the studio sends 4 Mbps, once. The studio link can be 40 times smaller, and adding a forty-first classroom costs nothing at the studio.</p></div>

<h3>How this module is organised</h3>
<ol>
<li>Chapters 2 and 3 teach multicast from zero: the three ways to send, then a stream's journey.</li>
<li>Chapters 4 and 5 teach QoS from zero: what goes wrong on a busy link, then how a packet is marked and treated.</li>
<li>Chapter 6 shows the simulator toolkit, and chapters 7 and 8 walk you through the two warm-up labs.</li>
<li>Chapter 9 gives a summary, the roadmap of the full track and an exam checklist.</li>
</ol>

<div class="note"><p><b>About the labs.</b> The simulator forwards multicast packets and counts QoS marks, but it does not carry real video or audio. Each lab brief ends with a sentence saying what is simulated and what is not, so you always know the scope.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that QoS makes a link faster. It does not. QoS cannot create bandwidth; it only decides who waits and who is dropped when there is not enough. If a link is too small all day, you need a bigger link, not a clever policy.</p></div>

<div class="scn"><h4>The robotic phone calls</h4><p>At a logistics depot in Nashik, staff complained every evening that calls to head office sounded like a robot. The network engineer first suspected the provider. The line graph showed 100 percent use between 6 and 7 pm, exactly when nightly backups started. The line was not broken, it was full, and voice packets were waiting behind backup packets. The fix was not a new line. The engineer marked voice packets and gave them a priority queue. The backup became a little slower, and calls sounded clean.</p><p><b>Lesson:</b> a full link treats all packets alike unless you tell it otherwise. QoS is how you tell it.</p></div>

<div class="iv"><p class="q">"Give me one example where multicast is the right choice and one where QoS is the right choice."</p><p>Strong answer: multicast for one-to-many streams such as IPTV or live lectures, because the source sends one copy per link instead of one per receiver. QoS for mixed traffic on a constrained link, such as voice and backups sharing a WAN, because it protects delay-sensitive packets. Add that QoS does not add bandwidth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast sends one copy and the network duplicates it only where paths split.</li>
<li>QoS decides which packets go first, and which are dropped, when a link is congested.</li>
<li>QoS does not create bandwidth; a link that is always too small needs upgrading.</li>
<li>Live classes, IPTV and voice are the real-world reasons both topics exist.</li>
<li>This module needs only basic IP knowledge and ends with two hands-on labs.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh Multicast and QoS track ka free starter module hai. End tak aapko simple words mein pata hoga ki ek sender hazaaron receivers tak network ko flood kiye bina kaise pahunch sakta hai (multicast), aur jab link bahut busy ho to network kaise decide karta hai ki kaunse packets pehle jaayein (QoS, yaani Quality of Service). Aap simulator mein ek working multicast stream bhi banaoge aur apne pehle voice packets mark karoge. <b>Prerequisites:</b> bas itna pata hona chahiye ki IP address, subnet mask aur router kya hota hai. Aur kuch nahi. Har naya word pehli baar aane par samjhaya gaya hai.</p>

<h3>Teen rozmarra ki kahaniyan</h3>
<p>Yeh teen situations hi wajah hain ki poora track bana hai. Inhe dhyan mein rakho; hum har ek par wapas aayenge.</p>
<ul>
<li><b>Live class.</b> Sahyadri University apne Pune studio se 40 classrooms tak 90 minute ka lecture stream karti hai. Agar studio har classroom ko alag copy bheje, to studio link par ek hi video ki 40 copies chalengi. Multicast mein studio ek copy bhejta hai, aur network extra copies sirf wahan banata hai jahan raasta split hota hai.</li>
<li><b>IPTV channel.</b> Deccan Broadcast ek news channel 50,000 set-top boxes ko bhejta hai. Unicast mein 50,000 streams chahiye. Multicast mein har channel ke liye ek stream, chahe kitne bhi log dekhein.</li>
<li><b>Busy link par voice call.</b> Nashik depot ki head office tak 10 Mbps line hai. Shaam 6 baje poora depot file backup shuru karta hai, line bhar jaati hai, aur phone call robot jaisi lagti hai. QoS router ko bolne deta hai: voice pehle, backups intezaar kar sakte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multicast aur QoS ek picture mein">
<rect x="10" y="10" width="300" height="210" rx="10" fill="#e2e8f0"/>
<text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Multicast: ek sender, kai receivers</text>
<rect x="30" y="100" width="70" height="40" rx="8" fill="#fde68a"/><text x="65" y="125" text-anchor="middle" class="svg-ink" font-size="12">Studio</text>
<rect x="135" y="100" width="50" height="40" rx="8" fill="#bae6fd"/><text x="160" y="125" text-anchor="middle" class="svg-ink" font-size="12">R</text>
<rect x="230" y="55" width="65" height="34" rx="8" fill="#bbf7d0"/><text x="262" y="77" text-anchor="middle" class="svg-ink" font-size="12">Class A</text>
<rect x="230" y="105" width="65" height="34" rx="8" fill="#bbf7d0"/><text x="262" y="127" text-anchor="middle" class="svg-ink" font-size="12">Class B</text>
<rect x="230" y="155" width="65" height="34" rx="8" fill="#bbf7d0"/><text x="262" y="177" text-anchor="middle" class="svg-ink" font-size="12">Class C</text>
<line x1="100" y1="120" x2="135" y2="120" stroke="#64748b" stroke-width="3"/>
<line x1="185" y1="115" x2="230" y2="72" stroke="#64748b" stroke-width="2"/><line x1="185" y1="120" x2="230" y2="122" stroke="#64748b" stroke-width="2"/><line x1="185" y1="125" x2="230" y2="172" stroke="#64748b" stroke-width="2"/>
<text x="160" y="210" text-anchor="middle" class="svg-muted" font-size="12">1 copy andar, copies sirf split par</text>
<rect x="330" y="10" width="300" height="210" rx="10" fill="#e2e8f0"/>
<text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">QoS: busy link par kaun pehle</text>
<rect x="345" y="60" width="60" height="30" rx="6" fill="#bbf7d0"/><text x="375" y="80" text-anchor="middle" class="svg-ink" font-size="12">Voice</text>
<rect x="345" y="100" width="60" height="30" rx="6" fill="#ddd6fe"/><text x="375" y="120" text-anchor="middle" class="svg-ink" font-size="12">Video</text>
<rect x="345" y="140" width="60" height="30" rx="6" fill="#fed7aa"/><text x="375" y="160" text-anchor="middle" class="svg-ink" font-size="12">Backup</text>
<rect x="450" y="60" width="50" height="110" rx="8" fill="#bae6fd"/><text x="475" y="120" text-anchor="middle" class="svg-ink" font-size="12">Router</text>
<line x1="405" y1="75" x2="450" y2="85" stroke="#64748b" stroke-width="2"/><line x1="405" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><line x1="405" y1="155" x2="450" y2="145" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="115" x2="600" y2="115" stroke="#64748b" stroke-width="6"/>
<text x="550" y="105" text-anchor="middle" class="svg-muted" font-size="12">patli link</text>
<text x="480" y="210" text-anchor="middle" class="svg-muted" font-size="12">voice pehle, backup intezaar</text>
</svg><p class="cap">Multicast kam bhej kar bandwidth bachata hai. QoS order decide karke important traffic ko bachata hai.</p></div>

<h3>Yeh dono topics saath kyun hain</h3>
<p>Multicast aur QoS do alag problems solve karte hain, lekin real networks mein dono milte hain. Live class multicast traffic hai aur delay-sensitive bhi, isliye use QoS chahiye. Voice call unicast hai, lekin uski quality QoS par depend karti hai. Jo engineers IPTV, video conferencing, stock-price feeds ya bade voice networks chalate hain unhe dono skills chahiye, aur network roles ke interviews mein aksar dono ke baare mein poochha jaata hai.</p>

<div class="eg"><p><b>Worked example, multicast na use karne ki keemat.</b> Ek lecture stream 4 Mbps ki hai. Chaalis classrooms ke saath unicast ka matlab 40 x 4 = 160 Mbps studio se nikalta hai. Multicast mein studio 4 Mbps, sirf ek baar bhejta hai. Studio link 40 guna chhota ho sakta hai, aur ek-chaalisvi classroom jodne par studio par koi extra cost nahi.</p></div>

<h3>Yeh module kaise organise hai</h3>
<ol>
<li>Chapters 2 aur 3 multicast zero se sikhate hain: bhejne ke teen tareeke, phir stream ka safar.</li>
<li>Chapters 4 aur 5 QoS zero se sikhate hain: busy link par kya galat hota hai, phir packet kaise mark aur treat hota hai.</li>
<li>Chapter 6 simulator toolkit dikhata hai, aur chapters 7 aur 8 do warm-up labs walk through karte hain.</li>
<li>Chapter 9 summary, poore track ka roadmap aur exam checklist deta hai.</li>
</ol>

<div class="note"><p><b>Labs ke baare mein.</b> Simulator multicast packets forward karta hai aur QoS marks count karta hai, lekin asli video ya audio nahi le jaata. Har lab brief ek sentence se khatam hota hai jo batata hai ki kya simulated hai aur kya nahi, taaki scope hamesha clear rahe.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki QoS link ko tez bana deta hai. Aisa nahi hai. QoS bandwidth paida nahi kar sakta; jab kam padti hai tab sirf yeh decide karta hai ki kaun ruke aur kiska packet drop ho. Agar link poora din chhoti padti hai, to aapko badi link chahiye, koi smart policy nahi.</p></div>

<div class="scn"><h4>Robot jaisi phone calls</h4><p>Nashik ke ek logistics depot mein staff har shaam shikayat karta tha ki head office ki calls robot jaisi lagti hain. Network engineer ne pehle provider par shak kiya. Line graph mein 6 se 7 baje tak 100 percent use dikha, theek jab nightly backups shuru hote the. Line toote hui nahi thi, bhari hui thi, aur voice packets backup packets ke peeche ruke the. Fix nayi line nahi thi. Engineer ne voice packets mark kiye aur unhe priority queue di. Backup thoda slow ho gaya, aur calls saaf sunayi dene lagi.</p><p><b>Seekh:</b> bhari hui link jab tak aap na bolo sab packets ko ek jaisa treat karti hai. QoS wahi bolne ka tareeka hai.</p></div>

<div class="iv"><p class="q">"Mujhe ek example do jahan multicast sahi choice hai aur ek jahan QoS sahi choice hai."</p><p>Strong answer: multicast one-to-many streams ke liye jaise IPTV ya live lectures, kyunki source har receiver ke liye nahi balki har link par ek copy bhejta hai. QoS mixed traffic ke liye constrained link par, jaise WAN par voice aur backups, kyunki yeh delay-sensitive packets ko bachata hai. Jodo ki QoS bandwidth add nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast ek copy bhejta hai aur network use sirf wahan duplicate karta hai jahan paths split hote hain.</li>
<li>QoS decide karta hai ki congested link par kaunse packets pehle jaayein, aur kaunse drop hon.</li>
<li>QoS bandwidth paida nahi karta; hamesha chhoti link ko upgrade chahiye.</li>
<li>Live classes, IPTV aur voice woh real-world wajah hain jinke liye dono topics bane.</li>
<li>Is module ko sirf basic IP knowledge chahiye aur yeh do hands-on labs par khatam hota hai.</li>
</ul></div>
`}};export{e as default};
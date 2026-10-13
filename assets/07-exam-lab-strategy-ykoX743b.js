var e={id:`exam-lab-strategy`,h:{en:`Exam lab strategy for the CCNA`,hi:`CCNA ke liye exam lab strategy`},body:{en:`
<p>A cricketer who scores centuries in the nets can still get out for a duck in the match if he walks in without a plan for the first ten balls. Exam labs are the same. Your knowledge is not the only thing that is tested: pressure, clock and the way you read the question are tested too. This chapter turns the capstone method into an exam routine you can rehearse until it is automatic.</p>

<h3>What the exam rewards</h3>
<p>The CCNA mixes multiple-choice questions with simulation-style items where you configure or inspect devices. The official blueprint is published by the vendor and changes over time. The current version (v1.1) will be replaced by v2.0 from 3 February 2027, and the new version puts <b>more weight on troubleshooting and verification</b>. Check the official blueprint for the exact objective list before you book. Whatever the version, the habit that earns marks is the same: read exactly what is asked, do exactly that, and prove it works.</p>

<h3>The five-phase routine</h3>
<div class="tbl"><table>
<tr><th>Phase</th><th>What you do</th><th>Share of the time</th></tr>
<tr><td>1. Read</td><td>Read the whole task and topology. Underline device names, VLAN numbers, addresses, "only", "must", "do not".</td><td>about 10 percent</td></tr>
<tr><td>2. Plan</td><td>Note on the scratch pad the order of tasks (layers) and the values you will use.</td><td>about 5 to 10 percent</td></tr>
<tr><td>3. Build</td><td>Configure in layer order, easiest and surest tasks first.</td><td>about 50 percent</td></tr>
<tr><td>4. Verify</td><td>Climb the verification ladder. Test positive and negative cases.</td><td>about 20 to 25 percent</td></tr>
<tr><td>5. Review</td><td>Re-read the question, compare each requirement to your result, save the configuration.</td><td>about 10 percent</td></tr>
</table></div>
<p>If you run a practice lab of 45 minutes, those shares become about 4 minutes to read, 3 to plan, 22 to build, 11 to verify and 5 to review. Time yourself, and when a single task eats more than its share, mark it and move on.</p>

<h3>Read the question fully</h3>
<p>Most lost marks in labs are not knowledge gaps. They are misreadings. Train three habits. First, read the <b>last line</b> of the task first, because it tells you the goal. Second, copy every literal value (names, numbers, descriptions) exactly, including capital letters, because an auto-checker compares text. Third, watch the words that narrow the task: "only", "at least", "the first usable address", "do not use a default route", "use the minimum number of commands".</p>

<h3>Verify, do not assume</h3>
<p>A typed command is not a working feature. After each task, run the matching show command from the ladder and read the output: the right VLAN, the neighbour in FULL, the translation in the table, the counter increasing on the permit line. If a check fails, you have time to fix it. If you never checked, you will not know until the score report.</p>

<h3>Partial credit and ordering</h3>
<p>Labs are normally scored by objectives, so a half-working answer can earn part of the marks. Use that. Do the tasks you are sure of first; never leave a task completely empty; do not break working items to attempt an uncertain one. If you must guess, guess in a way that cannot damage another objective (for example, do not change a trunk to fix a host port).</p>
<div class="eg"><p><b>Worked example.</b> Task text: "On HQ-R1 configure subinterfaces for VLAN 10 and VLAN 20 using the first usable address of each subnet. Configure PAT for hosts in 10.1.0.0/16 using the address on Gi0/1. Do not use a default route; the ISP advertises one by OSPF." Read: names HQ-R1, VLANs 10 and 20, "first usable", PAT source is the interface address (so <code>overload</code> on the interface), and a trap: no static default. Plan: layer 2 is the switch (maybe already done), then subinterfaces, then OSPF, then NAT. Build in that order. Verify: <code>show ip route</code> must show an <code>O*E2</code> default, not <code>S*</code>; <code>show ip nat translations</code> after a ping. Review: did I use "first usable" (.1) on both? Save. The trap is the default route sentence; a candidate who reflexively types <code>ip route 0.0.0.0</code> loses the point.</p></div>

<h3>Troubleshooting tasks</h3>
<p>For fault-finding tasks, resist the urge to look at the configuration first. Start from the symptom, test the gateway, climb the ladder, compare the working side with the broken side. Fix only what the evidence proves broken and write down each change. Many items contain more than one fault: after the first fix, repeat the original test.</p>

<div class="warn"><p><b>Common mistakes.</b> Spending twenty minutes on one hard task and leaving three easy ones untouched. Typing the correct command on the wrong device (read the prompt before pressing Enter). Using abbreviations the exam simulator does not accept, or relying on tab completion; practise full commands. Forgetting to save when persistence is requested. Changing an existing, working configuration that the question did not ask you to change.</p></div>

<div class="exam"><p><b>Exam traps.</b> The prompt tells you which device you are on; configuring R2 as R1 is the commonest "silent" error. Wildcard masks are not subnet masks. "Passive" and "shutdown" are different things. A ping that fails could be the ACL, not routing. If a task says "verify", it expects you to run a command, not to type nothing. Double-check interface names: Gi0/0/1 and Gi0/1 are different ports.</p></div>

<div class="scn"><h4>The candidate who knew everything and failed the lab</h4><p>A learner from Indore scored well on every practice test but failed a mock lab twice. A review of his session showed the pattern: he typed from memory, never read the final line of the task, never ran a show command, and spent 18 of 45 minutes on a single OSPF task. On the third attempt he used the five-phase routine, read first, built in layers, and verified each layer. He finished with 6 minutes spare and found one forgotten <code>no shutdown</code> in the review phase.</p><p><b>Lesson:</b> the routine, not extra knowledge, was the difference.</p></div>

<div class="iv"><p class="q">"How do you handle a timed hands-on assessment?"</p><p>Strong answer: I read the whole brief first, note the constraints, plan the order by layers, do sure tasks first, verify each with a show command rather than assume, cap the time on any one task, and use the last minutes to compare every requirement with my result and to save.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a fixed routine: read, plan, build, verify, review, with time shares you rehearse.</li>
<li>Read the full task: literal values, narrowing words and the last line.</li>
<li>Verify every task with a show command; typed is not working.</li>
<li>Take easy marks first, never leave tasks blank, and cap time per task.</li>
<li>The newer exam version emphasises troubleshooting, so practise the ladder and the five habits.</li>
</ul></div>
`,hi:`
<p>Jo cricketer nets mein centuries maarta hai, woh bhi match mein duck par out ho sakta hai agar woh pehli das balls ke plan ke bina andar chala gaya. Exam labs bhi aise hi hain. Sirf aapka knowledge test nahi hota: pressure, clock aur question padhne ka tareeka bhi test hota hai. Yeh chapter capstone method ko exam routine mein badalta hai jise aap itna rehearse karo ki automatic ho jaye.</p>

<h3>Exam kya reward karta hai</h3>
<p>CCNA mein multiple-choice questions aur simulation-style items milte hain jahan aap devices configure ya inspect karte ho. Official blueprint vendor publish karta hai aur woh waqt ke saath badalta hai. Current version (v1.1) ki jagah 3 February 2027 se v2.0 aayega, aur naya version <b>troubleshooting aur verification ko zyada weight</b> deta hai. Book karne se pehle exact objective list ke liye official blueprint dekho. Version jo bhi ho, marks dilane wali aadat wahi hai: jo poocha hai woh padho, bilkul wahi karo, aur prove karo ki chal raha hai.</p>

<h3>Paanch-phase routine</h3>
<div class="tbl"><table>
<tr><th>Phase</th><th>Aap kya karte ho</th><th>Time ka hissa</th></tr>
<tr><td>1. Read</td><td>Poora task aur topology padho. Device names, VLAN numbers, addresses, "only", "must", "do not" underline karo.</td><td>lagbhag 10 percent</td></tr>
<tr><td>2. Plan</td><td>Scratch pad par tasks ka order (layers) aur jo values use karoge likho.</td><td>lagbhag 5 se 10 percent</td></tr>
<tr><td>3. Build</td><td>Layer order mein configure karo, sabse aasaan aur pakke tasks pehle.</td><td>lagbhag 50 percent</td></tr>
<tr><td>4. Verify</td><td>Verification ladder chadho. Positive aur negative cases test karo.</td><td>lagbhag 20 se 25 percent</td></tr>
<tr><td>5. Review</td><td>Question dobara padho, har requirement ko apne result se milao, configuration save karo.</td><td>lagbhag 10 percent</td></tr>
</table></div>
<p>45 minute ke practice lab mein yeh hisse banenge: lagbhag 4 minute read, 3 plan, 22 build, 11 verify aur 5 review. Khud ko time karo, aur jab ek task apne hisse se zyada kha jaye to mark karke aage badho.</p>

<h3>Question poora padho</h3>
<p>Labs mein zyadatar marks knowledge gap se nahi, galat padhne se jaate hain. Teen aadatein banao. Pehli, task ki <b>aakhri line</b> pehle padho, kyunki woh goal batati hai. Doosri, har literal value (names, numbers, descriptions) bilkul waise hi copy karo, capital letters ke saath, kyunki auto-checker text compare karta hai. Teesri, task ko narrow karne wale words dekho: "only", "at least", "the first usable address", "do not use a default route", "use the minimum number of commands".</p>

<h3>Verify karo, assume mat karo</h3>
<p>Type kiya hua command chalta hua feature nahi hota. Har task ke baad ladder ka matching show command chalao aur output padho: sahi VLAN, neighbour FULL mein, translation table mein, permit line par counter badhta hua. Check fail ho to fix karne ka time hai. Agar check hi nahi kiya, to score report tak pata nahi chalega.</p>

<h3>Partial credit aur ordering</h3>
<p>Labs aam taur par objectives ke hisaab se score hote hain, to aadha-working answer bhi kuch marks dila sakta hai. Iska fayda uthao. Pakke tasks pehle karo; koi task bilkul khaali mat chhodo; uncertain task ke chakkar mein working items mat todo. Guess karna pade to aise karo ki doosre objective ko nuksan na pahunche (jaise host port theek karne ke liye trunk mat badlo).</p>
<div class="eg"><p><b>Worked example.</b> Task text: "HQ-R1 par VLAN 10 aur VLAN 20 ke liye subinterfaces configure karo, har subnet ka first usable address use karke. 10.1.0.0/16 ke hosts ke liye PAT configure karo, Gi0/1 ke address ke saath. Default route mat use karo; ISP OSPF se ek advertise karta hai." Padho: names HQ-R1, VLANs 10 aur 20, "first usable", PAT source interface address hai (to interface par <code>overload</code>), aur trap: static default nahi. Plan: layer 2 switch ka hai (shayad pehle se ho), phir subinterfaces, phir OSPF, phir NAT. Isi order mein build karo. Verify: <code>show ip route</code> mein <code>O*E2</code> default dikhna chahiye, <code>S*</code> nahi; ping ke baad <code>show ip nat translations</code>. Review: kya dono par "first usable" (.1) use kiya? Save. Trap default route wali sentence hai; jo candidate reflex mein <code>ip route 0.0.0.0</code> type kar deta hai woh point khota hai.</p></div>

<h3>Troubleshooting tasks</h3>
<p>Fault-finding tasks mein sabse pehle configuration dekhne ki aadat roko. Symptom se shuru karo, gateway test karo, ladder chadho, working side ko broken side se compare karo. Sirf wahi fix karo jo evidence se broken sabit hua, aur har change likhte jao. Bahut items mein ek se zyada faults hote hain: pehle fix ke baad original test dobara karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Ek mushkil task par bees minute lagana aur teen aasaan tasks chhod dena. Sahi command galat device par type karna (Enter dabane se pehle prompt padho). Aise abbreviations use karna jo exam simulator accept nahi karta, ya tab completion par nirbhar rehna; full commands practise karo. Persistence maangi gayi ho to save karna bhool jana. Existing working configuration badalna jo question ne badalne ko nahi kaha.</p></div>

<div class="exam"><p><b>Exam traps.</b> Prompt batata hai aap kis device par ho; R2 ko R1 samajhkar configure karna sabse common "silent" error hai. Wildcard masks subnet masks nahi hote. "Passive" aur "shutdown" alag cheezein hain. Fail hua ping ACL ki wajah se ho sakta hai, routing ki wajah se nahi. Task "verify" kahe to command chalana expected hai, kuch type na karna nahi. Interface names double-check karo: Gi0/0/1 aur Gi0/1 alag ports hain.</p></div>

<div class="scn"><h4>Candidate jo sab jaanta tha aur lab fail ho gaya</h4><p>Indore ke ek learner ne har practice test mein achha score kiya lekin mock lab do baar fail hua. Uske session ke review mein pattern dikha: yaad se type karna, task ki aakhri line kabhi nahi padhi, koi show command nahi chalaya, aur 45 minute mein se 18 minute ek hi OSPF task par lagaye. Teesri koshish mein usne paanch-phase routine use ki, pehle padha, layers mein build kiya, har layer verify ki. 6 minute bachakar khatam kiya aur review phase mein ek bhooli hui <code>no shutdown</code> pakdi.</p><p><b>Lesson:</b> fark routine ne dala, extra knowledge ne nahi.</p></div>

<div class="iv"><p class="q">"Timed hands-on assessment ko kaise handle karte ho?"</p><p>Strong answer: pehle poora brief padhta hoon, constraints note karta hoon, layers ke hisaab se order plan karta hoon, pakke tasks pehle karta hoon, har ek ko assume karne ki jagah show command se verify karta hoon, kisi ek task par time cap rakhta hoon, aur aakhri minutes mein har requirement ko apne result se milakar save karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed routine rakho: read, plan, build, verify, review, time shares ke saath jo aap rehearse karte ho.</li>
<li>Poora task padho: literal values, narrowing words aur aakhri line.</li>
<li>Har task show command se verify karo; typed matlab working nahi.</li>
<li>Easy marks pehle lo, tasks khaali mat chhodo, aur har task par time cap rakho.</li>
<li>Naya exam version troubleshooting par zor deta hai, isliye ladder aur paanch aadatein practise karo.</li>
</ul></div>
`}};export{e as default};
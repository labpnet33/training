var e={id:`dlp-and-sandbox`,h:{en:`DLP, malware protection and sandbox`,hi:`DLP, malware protection aur sandbox`},body:{en:`
<h3>Two directions, two guards</h3>
<p>Picture the loading dock of a warehouse. One guard checks what is <b>leaving</b> so nothing valuable walks out. Another checks what is <b>arriving</b> so nothing dangerous comes in. In web security the first guard is <b>DLP</b> (data loss prevention) and works on uploads. The second is <b>malware protection plus the sandbox</b> and works on downloads. Both are stages 5 and 6 of the pipeline from chapter 1, and both have one hard requirement: <b>they only see decrypted traffic</b>.</p>

<h3>DLP: spotting data that should not leave</h3>
<p>A DLP rule looks into the content of an upload using a <b>dictionary</b>: a set of patterns that describe sensitive data. The simulator has three: <code>card</code> (payment card numbers), <code>nid</code> (national ID numbers) and <code>secret</code> (things like keys and passwords). A rule has users, locations, a destination category or URLs, one or more dictionaries and an action. Like other rules it is ordered and first match wins.</p>
<p>At Sahyadri the client files are prepared for tests: expense.txt on PC-PUN holds a card number, ids.txt holds a national ID, notes.txt is harmless.</p>
<pre class="out">C:\\&gt; upload docs.share.example notes.txt
Result: 200 OK  (uploaded, no dictionary hit)
C:\\&gt; upload docs.share.example expense.txt
<span class="hl">Result: 403 BLOCKED  rule: Block-card-upload  dictionary: card</span>
C:\\&gt; upload docs.share.example ids.txt
Result: 200 OK  (no rule for dictionary nid)</pre>
<p>The third line teaches something: DLP blocks only what a rule names. The national ID got through because no rule used the <code>nid</code> dictionary. Adding it is a policy change, not a bug.</p>

<h3>Why DLP can be blind</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="DLP needs decryption">
<rect x="10" y="20" width="270" height="110" rx="8" fill="#bbf7d0"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="13">SSL decision: inspect</text><text x="145" y="70" text-anchor="middle" class="svg-ink" font-size="12">gateway reads the upload</text><text x="145" y="92" text-anchor="middle" class="svg-ink" font-size="12">DLP finds the card number</text><text x="145" y="114" text-anchor="middle" class="svg-ink" font-size="12">Result: blocked</text>
<rect x="360" y="20" width="270" height="110" rx="8" fill="#fed7aa"/><text x="495" y="45" text-anchor="middle" class="svg-ink" font-size="13">SSL decision: skip</text><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="12">gateway sees only ciphertext</text><text x="495" y="92" text-anchor="middle" class="svg-ink" font-size="12">DLP has nothing to read</text><text x="495" y="114" text-anchor="middle" class="svg-ink" font-size="12">Result: allowed, silently</text>
</svg><p class="cap">The same upload, two outcomes, decided one stage earlier.</p></div>
<p>This is the heart of ticket 321060. Symptom: card numbers reach docs.share.example (File sharing) although a DLP rule exists. Evidence: the DLP rule is enabled and correct; the Policy tester says the SSL decision for the destination is skip, deciding rule "Skip-file-sharing". Root cause: someone added a do-not-inspect rule for the File sharing category, perhaps to silence a user complaint, so DLP never sees the content. Fix: remove or narrow that skip rule so File sharing is inspected. Verify: repeat the upload of expense.txt and expect BLOCKED with the DLP rule name. Notice nobody touched the DLP rule: the fault lived one stage earlier.</p>

<h3>Downloads: malware protection and sandbox</h3>
<p><b>Malware protection</b> compares a download with knowledge of files that are known to be bad. In the simulator the switch is the block-malware setting, and malware.example/invoice.exe is a known malicious file: it is blocked, not delivered. <b>The sandbox</b> handles files nobody has judged yet. An unknown program is held in a safe, isolated test environment, run, and watched. A rule with action <code>block-until-verdict</code> keeps the user waiting until the verdict arrives. Sandbox rules apply to risky file types such as exe, dll and zip, not to every file.</p>
<table class="cmp"><tr><th>Download</th><th>What it is</th><th>Result</th></tr>
<tr><td>malware.example/invoice.exe</td><td>known malicious</td><td>blocked by malware protection</td></tr>
<tr><td>partners.example/setup-tool.exe</td><td>unknown program</td><td>held by sandbox until verdict</td></tr>
<tr><td>partners.example/price-list.pdf</td><td>clean document</td><td>delivered</td></tr>
<tr><td>docs.share.example/q3-report.xlsx</td><td>clean, large</td><td>delivered</td></tr></table>
<pre class="out">C:\\&gt; download partners.example/setup-tool.exe
<span class="hl">Result: HELD  rule: Sandbox-unknown-exe  action: block-until-verdict</span>
C:\\&gt; download malware.example/invoice.exe
Result: 403 BLOCKED  malware protection (known malicious)</pre>
<p>The sandbox and malware stages also need inspection. A skipped destination delivers files unexamined. If the block-malware setting is turned off, even a known bad file passes. Always check the setting, the sandbox rule and the SSL decision together.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> A DLP rule changes an upload from "relayed" to "refused with a block response" when a dictionary matches. A sandbox rule changes a download from "streamed" to "held until a verdict". Neither can act on encrypted data, so what really changes is whether the SSL decision gave them readable traffic.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Building a DLP rule and never checking whether the destination is inspected. (2) Assuming DLP catches every sensitive type: only named dictionaries are checked. (3) Applying the sandbox to all file types and annoying everyone. (4) Turning off malware blocking "temporarily".</p></div>
<div class="exam"><p><b>Exam trap.</b> "DLP rule is correct but data leaks": check SSL inspection of that destination first.</p></div>

<div class="scn"><h4>The expense file that left the building</h4><p>Finance noticed a card number inside a shared document. The DLP rule looked perfect. The engineer ran the same upload in the Policy tester, saw "SSL decision: skip", and found a skip rule added months earlier for File sharing. After narrowing the skip rule to one pinned application, the upload was blocked as intended.</p><p><b>Lesson:</b> a control is only as strong as the stage above it.</p></div>

<div class="iv"><p class="q">"What is DLP and why might it fail to block a leak?"</p><p>DLP inspects content against dictionaries such as card numbers and acts on uploads. It fails when the traffic is not decrypted, when no rule names the data type, or when a higher rule matches first. Mention checking the SSL decision and rule order.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DLP guards uploads; malware protection and sandbox guard downloads.</li>
<li>Both need decrypted traffic, so SSL inspection comes first.</li>
<li>DLP blocks only the dictionaries a rule names: card, nid, secret.</li>
<li>Known bad files are blocked; unknown programs are held until a verdict.</li>
<li>A skip rule on a category silently disables DLP and sandbox for it.</li>
</ul></div>
`,hi:`
<h3>Do directions, do guards</h3>
<p>Warehouse ke loading dock ki tasveer socho. Ek guard check karta hai ki kya <b>bahar ja raha hai</b> taaki koi keemti cheez na nikle. Doosra guard check karta hai ki kya <b>andar aa raha hai</b> taaki kuch khatarnak na aaye. Web security mein pehla guard <b>DLP</b> (data loss prevention) hai aur uploads par kaam karta hai. Doosra <b>malware protection aur sandbox</b> hai aur downloads par kaam karta hai. Dono chapter 1 ki pipeline ke stage 5 aur 6 hain, aur dono ki ek kadi shart hai: <b>woh sirf decrypted traffic dekhte hain</b>.</p>

<h3>DLP: jo data bahar nahi jaana chahiye use pakadna</h3>
<p>DLP rule upload ke content ke andar ek <b>dictionary</b> se dekhta hai: sensitive data describe karne wale patterns ka set. Simulator mein teen hain: <code>card</code> (payment card numbers), <code>nid</code> (national ID numbers) aur <code>secret</code> (keys aur passwords jaisi cheezein). Rule mein users, locations, destination category ya URLs, ek ya zyada dictionaries aur action hota hai. Baaki rules ki tarah yeh ordered hai aur first match wins.</p>
<p>Sahyadri mein client files tests ke liye tayyar hain: PC-PUN par expense.txt mein card number hai, ids.txt mein national ID hai, notes.txt harmless hai.</p>
<pre class="out">C:\\&gt; upload docs.share.example notes.txt
Result: 200 OK  (uploaded, no dictionary hit)
C:\\&gt; upload docs.share.example expense.txt
<span class="hl">Result: 403 BLOCKED  rule: Block-card-upload  dictionary: card</span>
C:\\&gt; upload docs.share.example ids.txt
Result: 200 OK  (no rule for dictionary nid)</pre>
<p>Teesri line kuch sikhati hai: DLP sirf wahi block karta hai jo rule mein named hai. National ID nikal gayi kyunki kisi rule ne <code>nid</code> dictionary use nahi ki. Use add karna policy change hai, bug nahi.</p>

<h3>DLP andha kyun ho sakta hai</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="DLP ko decryption chahiye">
<rect x="10" y="20" width="270" height="110" rx="8" fill="#bbf7d0"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="13">SSL decision: inspect</text><text x="145" y="70" text-anchor="middle" class="svg-ink" font-size="12">gateway upload padhta hai</text><text x="145" y="92" text-anchor="middle" class="svg-ink" font-size="12">DLP ko card number milta hai</text><text x="145" y="114" text-anchor="middle" class="svg-ink" font-size="12">Result: blocked</text>
<rect x="360" y="20" width="270" height="110" rx="8" fill="#fed7aa"/><text x="495" y="45" text-anchor="middle" class="svg-ink" font-size="13">SSL decision: skip</text><text x="495" y="70" text-anchor="middle" class="svg-ink" font-size="12">gateway ko sirf ciphertext dikhta hai</text><text x="495" y="92" text-anchor="middle" class="svg-ink" font-size="12">DLP ke paas padhne ko kuch nahi</text><text x="495" y="114" text-anchor="middle" class="svg-ink" font-size="12">Result: allowed, chupchaap</text>
</svg><p class="cap">Ek hi upload, do results, ek stage pehle decide hue.</p></div>
<p>Yahi ticket 321060 ka dil hai. Symptom: DLP rule hone ke bawajood card numbers docs.share.example (File sharing) tak pahunch rahe hain. Evidence: DLP rule enabled aur sahi hai; Policy tester kehta hai destination ka SSL decision skip hai, deciding rule "Skip-file-sharing". Root cause: kisi ne File sharing category ke liye do-not-inspect rule add kiya, shayad user ki complaint band karne ke liye, isliye DLP ko content kabhi dikhta hi nahi. Fix: us skip rule ko hatao ya narrow karo taaki File sharing inspect ho. Verify: expense.txt ka upload dobara karo aur DLP rule ke naam ke saath BLOCKED aana chahiye. Dhyan do, DLP rule ko kisi ne chhua nahi: fault ek stage pehle tha.</p>

<h3>Downloads: malware protection aur sandbox</h3>
<p><b>Malware protection</b> download ko un files ki knowledge se compare karta hai jo known bad hain. Simulator mein switch block-malware setting hai, aur malware.example/invoice.exe known malicious file hai: woh block hoti hai, deliver nahi. <b>Sandbox</b> un files ko handle karta hai jinhe abhi kisi ne judge nahi kiya. Unknown program ko safe, isolated test environment mein rokkar chalaya aur dekha jaata hai. <code>block-until-verdict</code> action wala rule verdict aane tak user ko rukata hai. Sandbox rules risky file types jaise exe, dll aur zip par lagte hain, har file par nahi.</p>
<table class="cmp"><tr><th>Download</th><th>Kya hai</th><th>Result</th></tr>
<tr><td>malware.example/invoice.exe</td><td>known malicious</td><td>malware protection se blocked</td></tr>
<tr><td>partners.example/setup-tool.exe</td><td>unknown program</td><td>verdict tak sandbox mein held</td></tr>
<tr><td>partners.example/price-list.pdf</td><td>clean document</td><td>delivered</td></tr>
<tr><td>docs.share.example/q3-report.xlsx</td><td>clean, large</td><td>delivered</td></tr></table>
<pre class="out">C:\\&gt; download partners.example/setup-tool.exe
<span class="hl">Result: HELD  rule: Sandbox-unknown-exe  action: block-until-verdict</span>
C:\\&gt; download malware.example/invoice.exe
Result: 403 BLOCKED  malware protection (known malicious)</pre>
<p>Sandbox aur malware stages ko bhi inspection chahiye. Skip ki hui destination files ko bina examine kiye deliver karti hai. Block-malware setting off ho to known bad file bhi nikal jaati hai. Setting, sandbox rule aur SSL decision, teeno ek saath check karo.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> DLP rule dictionary match hone par upload ko "relayed" se "block response ke saath refused" bana deta hai. Sandbox rule download ko "streamed" se "verdict tak held" bana deta hai. Dono encrypted data par kaam nahi kar sakte, to asal mein badalta yeh hai ki SSL decision ne unhe readable traffic diya ya nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) DLP rule bana lena aur kabhi check na karna ki destination inspect hoti hai ya nahi. (2) Sochna ki DLP har sensitive type pakadta hai: sirf named dictionaries check hoti hain. (3) Sandbox ko saare file types par laga dena aur sabko pareshan karna. (4) Malware blocking ko "temporarily" off karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "DLP rule sahi hai lekin data leak ho raha hai": pehle us destination ka SSL inspection check karo.</p></div>

<div class="scn"><h4>Expense file jo building se bahar gayi</h4><p>Finance ne ek shared document ke andar card number dekha. DLP rule bilkul perfect lag raha tha. Engineer ne wahi upload Policy tester mein chalaya, "SSL decision: skip" dekha, aur mahino pehle File sharing ke liye add hua skip rule mila. Skip rule ko ek pinned application tak narrow karne ke baad upload intended tareeke se block hua.</p><p><b>Seekh:</b> control utna hi mazboot hai jitna uske upar ka stage.</p></div>

<div class="iv"><p class="q">"DLP kya hai aur woh leak block karne mein fail kyun ho sakta hai?"</p><p>DLP content ko card numbers jaisi dictionaries se inspect karta hai aur uploads par action leta hai. Woh tab fail hota hai jab traffic decrypted na ho, jab koi rule us data type ka naam na le, ya jab upar ka rule pehle match ho jaye. SSL decision aur rule order check karne ki baat mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DLP uploads guard karta hai; malware protection aur sandbox downloads guard karte hain.</li>
<li>Dono ko decrypted traffic chahiye, isliye SSL inspection pehle aata hai.</li>
<li>DLP sirf wahi dictionaries block karta hai jo rule mein named hain: card, nid, secret.</li>
<li>Known bad files block hoti hain; unknown programs verdict tak held rehte hain.</li>
<li>Category par skip rule chupchaap DLP aur sandbox ko disable kar deta hai.</li>
</ul></div>
`}};export{e as default};
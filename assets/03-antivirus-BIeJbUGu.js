var e={id:`antivirus`,h:{en:`Antivirus profile: stopping known malware in transit`,hi:`Antivirus profile: transit mein jaani-pehchani malware rokna`},body:{en:`
<p>The <b>antivirus profile</b> scans files and data carried by selected protocols and compares them with signatures of known malware. Think of the baggage scanner that has a photo book of forbidden items: it recognises an item it has seen before. It is excellent at what is known and is not designed to find something brand new, which is the job of WildFire (a later chapter).</p>
<h3>Decoders and actions</h3>
<p>The profile is organised by <b>decoder</b>, the protocol the firewall can unpack: <code>h&#116;tp</code>, <code>h&#116;tp2</code>, <code>smtp</code>, <code>imap</code>, <code>pop3</code>, <code>ftp</code> and <code>smb</code>. For each decoder you choose an action for signatures from the antivirus content and a separate action for signatures that come from WildFire.</p>
<table class="cmp"><tr><th>Action</th><th>Effect</th></tr><tr><td><code>default</code></td><td>use the default action stored in the signature</td></tr><tr><td><code>allow</code></td><td>let it pass, no log</td></tr><tr><td><code>alert</code></td><td>let it pass and write a threat log</td></tr><tr><td><code>drop</code></td><td>silently discard the packet</td></tr><tr><td><code>reset-client</code> / <code>reset-server</code> / <code>reset-both</code></td><td>discard and send TCP resets so the transfer ends</td></tr></table>
<p>For web downloads the usual best practice is to <b>reset-both</b> for known malware; for mail protocols a reset is not always useful, so the defaults differ by decoder. Start a new deployment in <code>alert</code> to see what would be blocked, then move to a blocking action when the logs are clean.</p>
<h3>Reference configuration</h3>
<pre class="code"># Reference configuration (not run in the simulator)
set profiles virus NK-AV decoder h&#116;tp action reset-both
set profiles virus NK-AV decoder h&#116;tp wildfire-action reset-both
set profiles virus NK-AV decoder smtp action alert
set profiles virus NK-AV decoder smb action reset-both
set profiles virus NK-AV description "Pune baseline antivirus profile"</pre>
<div class="note"><p>Exact keywords can differ between releases. On a real firewall use the question mark completion to confirm each keyword before you rely on this text.</p></div>
<h3>Signatures come from content updates</h3>
<p>The antivirus signatures, the application signatures and the threat signatures are delivered as <b>content updates</b>. They are scheduled on the firewall, and the installed versions are visible in the system information. This output is from the simulator; the numbers are the simulator's own placeholders, so read the <i>fields</i>, not the values:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show system info
hostname: NK-PUNE-PA
model: PA-VM
sw-version: 11.1.4 (NK-OS educational simulator)
<span class="hl">app-version: 8800-8800</span>
<span class="hl">threat-version: 8800-8800</span></pre>
<p><code>app-version</code> is the application content (App-ID), <code>threat-version</code> the threat and vulnerability content. On a real firewall the antivirus content is shown separately in the dynamic updates list. A common operational rule: schedule the downloads and the install, keep a short delay on new threat content, and monitor that the installed version moves forward.</p>
<div class="eg"><p><b>Worked example.</b> A file download of 8 MB passes through <code>Allow-Out</code> on TCP 80. The decoder for <code>h&#116;tp</code> unpacks the stream and scans the file. If a signature matches and the action is <code>reset-both</code>, the firewall sends TCP resets to the client and the server, the download stops and a threat log entry records the signature name, the source and the destination. If the same file were sent over TLS without decryption, the decoder would see only encrypted bytes and nothing would match.</p></div>
<div class="warn"><p><b>Common mistake.</b> Leaving every decoder on <code>default</code> forever. Defaults are a starting point; review the actions per decoder and keep content updates current.</p></div>
<div class="exam"><p><b>Exam trap.</b> Antivirus catches <b>known</b> malware by signature. WildFire handles <b>unknown</b> files. The antivirus profile has a separate action for signatures delivered by WildFire.</p></div>
<div class="scn"><h4>The protocol that was not scanned</h4><p>A user received an infected attachment by file share. The profile scanned web and mail, but the SMB decoder had been left on allow because "internal file shares are trusted". Setting the SMB decoder to a blocking action and attaching the group to the internal zone rule closed the gap. The lesson was documented as a rule: every decoder is a deliberate choice.</p><p><b>Lesson:</b> review each decoder, not just the web one.</p></div>
<div class="iv"><p class="q">"How does the antivirus profile work and what are its limits?"</p><p>It is stream based: the firewall decodes selected protocols, scans the content against antivirus signatures and applies an action per decoder (alert, drop or reset). Its limits are that it detects known malware only, needs current content updates, and cannot see inside encrypted traffic unless decryption is used. WildFire and machine-learning features address unknown files.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Antivirus compares content with signatures of known malware.</li><li>The profile is per decoder (web, mail, ftp, smb) with an action each.</li><li>Signatures arrive by content updates; keep them current.</li><li>Encrypted traffic is invisible without decryption.</li></ul></div>
`,hi:`
<p><b>Antivirus profile</b> chune hue protocols se guzarne wali files aur data scan karta hai aur unhe jaani-pehchani malware ke signatures se compare karta hai. Us baggage scanner ko socho jiske paas mana kiye gaye saaman ki photo book hai: jo cheez pehle dekhi hai use pehchan leta hai. Jo jaana-pehchana hai usme yeh bahut achha hai aur bilkul nayi cheez dhoondne ke liye bana nahi, woh WildFire ka kaam hai (agla chapter).</p>
<h3>Decoders aur actions</h3>
<p>Profile <b>decoder</b> ke hisaab se bana hai, woh protocol jo firewall unpack kar sakta hai: <code>h&#116;tp</code>, <code>h&#116;tp2</code>, <code>smtp</code>, <code>imap</code>, <code>pop3</code>, <code>ftp</code> aur <code>smb</code>. Har decoder ke liye antivirus content ke signatures ka action aur WildFire se aane wale signatures ka alag action chunte ho.</p>
<table class="cmp"><tr><th>Action</th><th>Asar</th></tr><tr><td><code>default</code></td><td>signature mein stored default action use karo</td></tr><tr><td><code>allow</code></td><td>jaane do, log nahi</td></tr><tr><td><code>alert</code></td><td>jaane do aur threat log likho</td></tr><tr><td><code>drop</code></td><td>packet chupchaap discard karo</td></tr><tr><td><code>reset-client</code> / <code>reset-server</code> / <code>reset-both</code></td><td>discard aur TCP reset bhejo taaki transfer khatam ho</td></tr></table>
<p>Web downloads ke liye aam best practice known malware par <b>reset-both</b> hai; mail protocols mein reset hamesha kaam nahi aata, isliye defaults decoder ke hisaab se alag hain. Naye deployment ko <code>alert</code> mein shuru karo taaki dikhe kya block hota, phir logs saaf hone par blocking action par jao.</p>
<h3>Reference configuration</h3>
<pre class="code"># Reference configuration (not run in the simulator)
set profiles virus NK-AV decoder h&#116;tp action reset-both
set profiles virus NK-AV decoder h&#116;tp wildfire-action reset-both
set profiles virus NK-AV decoder smtp action alert
set profiles virus NK-AV decoder smb action reset-both
set profiles virus NK-AV description "Pune baseline antivirus profile"</pre>
<div class="note"><p>Exact keywords releases ke beech alag ho sakte hain. Asli firewall par is text par bharosa karne se pehle har keyword ko question mark completion se confirm karo.</p></div>
<h3>Signatures content updates se aate hain</h3>
<p>Antivirus signatures, application signatures aur threat signatures <b>content updates</b> ke roop mein aate hain. Yeh firewall par schedule hote hain, aur installed versions system information mein dikhte hain. Yeh output simulator ka hai; numbers simulator ke apne placeholders hain, isliye <i>fields</i> padho, values nahi:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show system info
hostname: NK-PUNE-PA
model: PA-VM
sw-version: 11.1.4 (NK-OS educational simulator)
<span class="hl">app-version: 8800-8800</span>
<span class="hl">threat-version: 8800-8800</span></pre>
<p><code>app-version</code> application content (App-ID) hai, <code>threat-version</code> threat aur vulnerability content. Asli firewall par antivirus content dynamic updates list mein alag dikhta hai. Ek aam operational rule: downloads aur install schedule karo, naye threat content par chhota delay rakho, aur monitor karo ki installed version aage badh raha hai.</p>
<div class="eg"><p><b>Worked example.</b> 8 MB ki file download <code>Allow-Out</code> se TCP 80 par guzarti hai. <code>h&#116;tp</code> decoder stream unpack karke file scan karta hai. Signature match ho aur action <code>reset-both</code> ho to firewall client aur server dono ko TCP reset bhejta hai, download ruk jaata hai aur threat log entry signature naam, source aur destination record karti hai. Wahi file TLS par bina decryption bheji jaaye to decoder ko sirf encrypted bytes dikhte hain aur kuch match nahi hota.</p></div>
<div class="warn"><p><b>Common mistake.</b> Har decoder ko hamesha <code>default</code> par chhod dena. Defaults shuruaat hain; decoder ke hisaab se actions review karo aur content updates current rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Antivirus <b>known</b> malware ko signature se pakadta hai. WildFire <b>unknown</b> files sambhalta hai. Antivirus profile mein WildFire se aane wale signatures ka alag action hota hai.</p></div>
<div class="scn"><h4>Woh protocol jo scan nahi hua</h4><p>Ek user ko file share se infected attachment mila. Profile web aur mail scan karta tha, lekin SMB decoder "internal file shares trusted hain" kehkar allow par chhoda gaya tha. SMB decoder ko blocking action par karne aur group ko internal zone rule par lagane se gap band hua. Sabak rule ban gaya: har decoder ek soch-samajh ka choice hai.</p><p><b>Lesson:</b> sirf web wala nahi, har decoder review karo.</p></div>
<div class="iv"><p class="q">"Antivirus profile kaise kaam karta hai aur uski seemayein kya hain?"</p><p>Yeh stream based hai: firewall chune hue protocols decode karta hai, content ko antivirus signatures se scan karta hai aur har decoder ke liye action lagata hai (alert, drop ya reset). Seemayein: sirf known malware detect hota hai, current content updates chahiye, aur decryption ke bina encrypted traffic ke andar nahi dekh sakta. Unknown files ke liye WildFire aur machine-learning features hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Antivirus content ko known malware ke signatures se compare karta hai.</li><li>Profile decoder ke hisaab se hai (web, mail, ftp, smb), har ek ka action.</li><li>Signatures content updates se aate hain; unhe current rakho.</li><li>Decryption ke bina encrypted traffic invisible hai.</li></ul></div>
`}};export{e as default};
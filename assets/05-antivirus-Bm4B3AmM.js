var e={id:`antivirus`,h:{en:`Antivirus profiles: scanning files, protocols and actions`,hi:`Antivirus profiles: files scan karna, protocols aur actions`},body:{en:`
<p>If the web filter checks where you are going, <b>antivirus</b> checks what you are carrying back. When someone downloads a document, installs a program, or receives an attachment, the FortiGate can compare the file against FortiGuard antivirus signatures and block it before it reaches the endpoint. This is a second line of defence: endpoint protection still matters, but a gateway scan stops known threats once, for everybody behind it.</p>
<p>In this course threats are always simulated. We use a <b>known-bad test file</b> that antivirus engines are designed to recognise, never a real malicious sample.</p>

<h3>What gets scanned, and how</h3>
<p>An antivirus profile enables scanning per protocol: HTTP, FTP, SMTP, POP3, IMAP, CIFS (Windows file shares) and SSH. For each protocol you choose an action in <code>av-scan</code>: <code>block</code> (stop the file and replace it with a notice), <code>monitor</code> (allow and log) or <code>disable</code>. You can also keep suspicious files for study with <code>quarantine</code>, if the device has local disk or a connected FortiAnalyzer or FortiSandbox.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config antivirus profile
    edit "NK-AV"
        set comment "Block known malware on web, mail and shares"
        set feature-set flow
        config h&#116;tp
            set av-scan block
        end
        config ftp
            set av-scan block
        end
        config smtp
            set av-scan block
        end
        config imap
            set av-scan block
        end
        config cifs
            set av-scan block
        end
    next
end</pre>
<p>Notice that the HTTP section uses a CLI keyword in lowercase; it is just the protocol name. For HTTPS downloads the FortiGate can scan the file only if the policy's SSL profile decrypts the session (deep inspection), because otherwise the file is hidden inside the encrypted stream.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Antivirus flow">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">File in transit</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">download, mail</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">SSL profile</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">decrypt if deep</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">AV engine</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">signatures, outbreak</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Action</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">block, monitor, log</text>
</svg><p class="cap">Antivirus can only scan what it can read. Encrypted downloads need deep inspection first.</p></div>

<h3>Signature sets and outbreak prevention</h3>
<p>FortiGuard antivirus databases are updated continually. Besides regular signatures, an <b>outbreak prevention</b> database carries hashes of newly seen malware before the full signature exists. Content-disarm features, sandboxing (sending unknown files to FortiSandbox) and EMS threat feeds from endpoints can extend the profile. The set of databases available depends on licence.</p>

<h3>Flow versus proxy antivirus</h3>
<p><b>Flow-based</b> AV scans the stream as it goes with a small buffer, and decides at the end of the file. It is quick, but the first bytes may already have reached the client, so the FortiGate blocks the rest and resets the session. <b>Proxy-based</b> AV holds the whole file, scans it, and releases only clean files, which is safer for downloads but uses memory and adds delay. Some large-file and archive behaviours differ between the two. Choose proxy where the extra assurance is worth the cost, for example on a mail gateway policy.</p>

<h3>Limits you must know</h3>
<ul>
<li><b>Maximum file size</b>: files larger than the scan limit are not scanned (and may be passed or blocked depending on protocol options).</li>
<li><b>Encrypted archives</b>: a password-protected zip cannot be read, so it is a known blind spot; treat such files by policy (block, or send to sandbox).</li>
<li><b>Signature-based only</b>: new, never-seen malware may pass until a signature exists; that is why IPS, web filter, sandbox and endpoint protection work together.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A user in Pune opens a download link. The web filter allows the site (Business category). The file crosses the FortiGate over HTTPS with deep inspection. The AV engine matches the known-bad test file signature, the action is block, and the user sees a replacement message while the log records <code>virus="NKSim.TestFile.Marker"</code>-style information: file name, virus name, source, destination, action. The endpoint never received a working file.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling antivirus and assuming HTTPS downloads are covered. With certificate inspection or no-inspection the file is encrypted, so antivirus sees nothing. The profile looks correct in the GUI yet nothing is ever detected.</p></div>
<div class="exam"><p><b>Exam trap.</b> Antivirus actions per protocol are block, monitor and disable. Scanning of encrypted traffic needs deep inspection. The scan engine has size limits and cannot open encrypted archives.</p></div>

<div class="scn"><h4>The attachment that was never scanned</h4><p>A branch received a malicious attachment although antivirus was "on". The mail was delivered over an encrypted connection to a cloud provider, the policy used no-inspection, and the profile had SMTP scanning enabled. The gateway could not read the mail. The team moved mail scanning to the cloud provider's own filter and enabled deep inspection with exemptions only for protected categories on user web traffic.</p><p><b>Lesson:</b> a profile configured correctly can still see nothing; always trace the data path and ask whether the FortiGate can actually read it.</p></div>

<div class="iv"><p class="q">"What is the difference between flow-based and proxy-based antivirus?"</p><p>Flow-based scans packets as a stream with low latency and high throughput, deciding at the end of the object, so some data may already have passed. Proxy-based buffers the full file, scans it, then releases it, giving a cleaner block but more memory and delay. Choose per policy based on risk and performance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antivirus compares files to FortiGuard signatures; actions block, monitor, disable per protocol.</li>
<li>Protocols: HTTP, FTP, SMTP, POP3, IMAP, CIFS, SSH.</li>
<li>Encrypted downloads need deep inspection to be scanned.</li>
<li>Flow mode is fast; proxy mode holds the whole file and is stricter.</li>
<li>Known blind spots: oversize files, encrypted archives, brand-new malware.</li>
</ul></div>
`,hi:`
<p>Agar web filter check karta hai ki aap kahan ja rahe ho, to <b>antivirus</b> check karta hai ki aap kya wapas la rahe ho. Jab koi document download karta hai, program install karta hai, ya attachment receive karta hai, FortiGate file ko FortiGuard antivirus signatures se compare karke endpoint tak pahunchne se pehle block kar sakta hai. Yeh doosri line of defence hai: endpoint protection ab bhi zaroori hai, lekin gateway scan known threats ko ek baar mein sabke liye rok deta hai.</p>
<p>Is course mein threats hamesha simulated hote hain. Hum <b>known-bad test file</b> use karte hain jise antivirus engines pehchanne ke liye bane hote hain, kabhi real malicious sample nahi.</p>

<h3>Kya scan hota hai, aur kaise</h3>
<p>Antivirus profile har protocol ke liye scanning enable karta hai: HTTP, FTP, SMTP, POP3, IMAP, CIFS (Windows file shares) aur SSH. Har protocol ke liye <code>av-scan</code> mein action chunte ho: <code>block</code> (file rok kar notice se replace), <code>monitor</code> (allow aur log) ya <code>disable</code>. Suspicious files ko study ke liye <code>quarantine</code> se rakh sakte ho, agar device mein local disk ya connected FortiAnalyzer ya FortiSandbox ho.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config antivirus profile
    edit "NK-AV"
        set comment "Block known malware on web, mail and shares"
        set feature-set flow
        config h&#116;tp
            set av-scan block
        end
        config ftp
            set av-scan block
        end
        config smtp
            set av-scan block
        end
        config imap
            set av-scan block
        end
        config cifs
            set av-scan block
        end
    next
end</pre>
<p>Dhyan do ki HTTP wale section mein CLI keyword lowercase mein hai; woh bas protocol ka naam hai. HTTPS downloads mein FortiGate file tabhi scan kar sakta hai jab policy ka SSL profile session decrypt kare (deep inspection), warna file encrypted stream mein chhupi rehti hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Antivirus flow">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">File in transit</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">download, mail</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">SSL profile</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">deep ho to decrypt</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">AV engine</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">signatures, outbreak</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.4">Action</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.4">block, monitor, log</text>
</svg><p class="cap">Antivirus sirf wahi scan karta hai jo padh sake. Encrypted downloads ko pehle deep inspection chahiye.</p></div>

<h3>Signature sets aur outbreak prevention</h3>
<p>FortiGuard antivirus databases lagataar update hote hain. Regular signatures ke alawa <b>outbreak prevention</b> database naye dekhe gaye malware ke hashes rakhta hai, poori signature banne se pehle. Content-disarm features, sandboxing (unknown files FortiSandbox ko bhejna) aur endpoints se EMS threat feeds profile ko badha sakte hain. Kaun se databases available hain yeh licence par depend karta hai.</p>

<h3>Flow versus proxy antivirus</h3>
<p><b>Flow-based</b> AV stream ko chhote buffer ke saath chalte hue scan karta hai aur file ke end par decide karta hai. Yeh quick hai, lekin shuru ke bytes client tak pahunch chuke ho sakte hain, isliye FortiGate baaki rok kar session reset karta hai. <b>Proxy-based</b> AV poori file rokta hai, scan karta hai, aur sirf clean files chhodta hai, jo downloads ke liye safer hai lekin memory aur delay badhata hai. Large-file aur archive behaviour dono mein alag ho sakte hain. Jahan extra assurance ki keemat jaayaz ho, jaise mail gateway policy, wahan proxy chuno.</p>

<h3>Limits jo jaanna zaroori hai</h3>
<ul>
<li><b>Maximum file size</b>: scan limit se badi files scan nahi hoti (aur protocol options ke hisaab se pass ya block ho sakti hain).</li>
<li><b>Encrypted archives</b>: password-protected zip padhi nahi ja sakti, yeh known blind spot hai; aisi files ko policy se handle karo (block, ya sandbox bhejo).</li>
<li><b>Sirf signature-based</b>: bilkul naya malware signature banne tak pass ho sakta hai; isiliye IPS, web filter, sandbox aur endpoint protection saath kaam karte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune ka ek user download link kholta hai. Web filter site allow karta hai (Business category). File FortiGate se HTTPS par deep inspection ke saath guzarti hai. AV engine known-bad test file signature match karta hai, action block hai, user ko replacement message milta hai aur log mein <code>virus="NKSim.TestFile.Marker"</code> jaisi jaankari record hoti hai: file name, virus name, source, destination, action. Endpoint ko kabhi working file mili hi nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Antivirus enable karke maan lena ki HTTPS downloads covered hain. Certificate inspection ya no-inspection mein file encrypted hoti hai, isliye antivirus ko kuch nahi dikhta. GUI mein profile sahi dikhta hai lekin kuch kabhi detect nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Protocol ke hisaab se antivirus actions block, monitor aur disable hain. Encrypted traffic scan karne ke liye deep inspection chahiye. Scan engine ki size limits hain aur woh encrypted archives nahi khol sakta.</p></div>

<div class="scn"><h4>Attachment jo kabhi scan hua hi nahi</h4><p>Ek branch ko malicious attachment mila jabki antivirus "on" tha. Mail cloud provider ko encrypted connection se deliver hua, policy no-inspection use karti thi, aur profile mein SMTP scanning enabled thi. Gateway mail padh hi nahi sakta tha. Team ne mail scanning cloud provider ke apne filter par move ki aur user web traffic par deep inspection enable kiya, sirf protected categories ke exemptions ke saath.</p><p><b>Lesson:</b> sahi configured profile bhi kuch dekh nahi sakta; hamesha data path trace karo aur poochho ki FortiGate asal mein padh sakta hai ya nahi.</p></div>

<div class="iv"><p class="q">"Flow-based aur proxy-based antivirus mein kya difference hai?"</p><p>Flow-based packets ko stream ki tarah low latency aur high throughput se scan karta hai, object ke end par decide karta hai, isliye kuch data pehle nikal chuka ho sakta hai. Proxy-based poori file buffer karta hai, scan karta hai, phir release karta hai, jisse block saaf hota hai lekin memory aur delay zyada. Risk aur performance ke hisaab se policy ke hisaab se chuno.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antivirus files ko FortiGuard signatures se compare karta hai; protocol ke hisaab se actions block, monitor, disable.</li>
<li>Protocols: HTTP, FTP, SMTP, POP3, IMAP, CIFS, SSH.</li>
<li>Encrypted downloads scan karne ke liye deep inspection chahiye.</li>
<li>Flow mode fast; proxy mode poori file rokta hai aur zyada strict hai.</li>
<li>Known blind spots: oversize files, encrypted archives, bilkul naya malware.</li>
</ul></div>
`}};export{e as default};
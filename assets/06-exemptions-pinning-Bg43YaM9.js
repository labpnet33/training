var e={id:`exemptions-pinning`,h:{en:`Exemptions: banking, health, updates and certificate pinning`,hi:`Exemptions: banking, health, updates aur certificate pinning`},body:{en:`
<p>Deep inspection is never "all or nothing". Every real deployment has a list of things that are <b>not</b> decrypted. There are two reasons: <b>respect</b> (some traffic is too private to open) and <b>reality</b> (some applications simply break). This chapter shows how to build that list on purpose rather than by accident.</p>

<h3>Exempt for privacy and law</h3>
<p>Categories such as <b>Finance and Banking</b>, <b>Health and Wellness</b> and <b>Medicine</b> contain the most sensitive personal data: account numbers, passwords, diagnoses. Decrypting them creates risk for the company with little security benefit, and may be restricted by law or by your own employment agreements. Best practice is to exempt these FortiGuard categories from deep inspection. The built-in deep-inspection profile already carries some such exemptions, but you must read yours, not assume.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall wildcard-fqdn custom
    edit "NK-UPDATE-HOSTS"
        set wildcard-fqdn "*.updates.example"
    next
end
config firewall ssl-ssh-profile
    edit "NK-DEEP"
        config ssl-exempt
            edit 1
                set type fortiguard-category
                set fortiguard-category 31
            next
            edit 2
                set type fortiguard-category
                set fortiguard-category 33
            next
            edit 3
                set type fortiguard-category
                set fortiguard-category 35
            next
            edit 4
                set type wildcard-fqdn
                set wildcard-fqdn "NK-UPDATE-HOSTS"
            next
            edit 5
                set type address
                set address "PARTNER-ERP-SRV"
            next
        end
        set ssl-exemption-log enable
    next
end</pre>
<p>Categories 31, 33 and 35 are Finance and Banking, Health and Wellness and Medicine. Exemption types are <code>fortiguard-category</code>, <code>address</code> (an address object), <code>wildcard-fqdn</code> (host-name patterns) and <code>regex</code>. Remember that an exempt site is also invisible to antivirus and IPS, so keep the list short and reviewed.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Exemption decision">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">Session starts</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">ClientHello</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">Exempt?</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">category, host, IP</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">Yes</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">certificate level only</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">No</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">deep inspection</text>
</svg><p class="cap">Exemptions are evaluated at the start of the session, before any decryption.</p></div>

<h3>Exempt because of technology: certificate pinning</h3>
<p><b>Certificate pinning</b> means an application has a certificate or public key built in and refuses any other, including the FortiGate's re-signed one, even if the device trusts the FortiGate CA. Mobile banking apps, some update services, many cloud sync clients, messaging apps, and some developer tools pin. When pinning applies, deep inspection causes the application to fail with a vague connection error. Inspection cannot solve this: the right answer is an exemption (by host name, FQDN or address) for that application's servers. Pinning is a security feature of the application, not a fault in your firewall.</p>
<p>Other common exemption candidates: operating-system and security-product update hosts, applications that use client certificates (mutual TLS), legacy servers with weak ciphers that fail the re-negotiation, and internal servers where you already control both ends.</p>

<h3>Finding what to exempt</h3>
<ol>
<li>Pilot deep inspection with a small group in monitor-friendly conditions.</li>
<li>Ask the helpdesk for tickets that say "app works at home but not in the office".</li>
<li>Read the SSL logs: handshake failures and anomalies, with the host name.</li>
<li>Test from a client with the application and, if the application works only with the exemption, add the narrowest host pattern that fixes it.</li>
<li>Record the reason and an owner for each exemption.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> After enabling deep inspection, the HR mobile app for the staff health portal fails to log in. The app pins its certificate. HR's portal host is <code>clinic.example</code>, a Health and Wellness category site, which is already covered by the category exemption, so the app was failing for a different, second host: its update service at <code>cdn.clinic.example</code>. The team added that wildcard to the exempt list, the app worked, and the exemption log showed the hits.</p></div>

<div class="warn"><p><b>Common mistake.</b> Exempting a huge wildcard such as every host in a large cloud provider to "make the app work". That removes inspection for thousands of unrelated services. Find the specific host names in the logs and exempt only those.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exemption types: FortiGuard category, address, wildcard FQDN and regex. Exempted traffic is not decrypted, so antivirus, IPS and URL-path filtering cannot see it. Pinned applications fail under deep inspection until exempted.</p></div>

<div class="scn"><h4>The bank and the auditor</h4><p>An internal audit asked: "Can the security team read staff online banking sessions?" The honest answer, from the profile, was yes: the Finance and Banking category exemption had been deleted during a clean-up. The team restored it that day, documented that banking, health and personal-privacy categories are exempt by policy, and wrote a quarterly check that compares the live profile with the approved baseline.</p><p><b>Lesson:</b> sensitive categories are exempt by design; verify it, do not assume it.</p></div>

<div class="iv"><p class="q">"Which traffic would you exempt from deep inspection and why?"</p><p>Sensitive categories such as Finance and Banking and Health, for privacy and legal reasons; applications that use certificate pinning or client certificates, because they break; update services and legacy servers that fail re-negotiation. I keep the list narrow, logged, documented and reviewed, and I accept that exempt traffic is not scanned.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exempt for privacy (banking, health) and for technology (pinning, client certificates, updates).</li>
<li>Types: fortiguard-category, address, wildcard-fqdn, regex.</li>
<li>Exempt traffic is invisible to antivirus, IPS and URL-path filtering.</li>
<li>Pinning is an application security feature; the fix is an exemption.</li>
<li>Keep exemptions narrow, logged and reviewed.</li>
</ul></div>
`,hi:`
<p>Deep inspection kabhi "sab ya kuch nahi" nahi hota. Har real deployment mein ek list hoti hai jo decrypt <b>nahi</b> hoti. Do wajah hain: <b>respect</b> (kuch traffic itna private hai ki khola nahi jaata) aur <b>reality</b> (kuch applications seedhe toot jaati hain). Yeh chapter dikhata hai ki woh list galti se nahi, soch-samajhkar kaise banayein.</p>

<h3>Privacy aur law ke liye exempt</h3>
<p><b>Finance and Banking</b>, <b>Health and Wellness</b> aur <b>Medicine</b> jaisi categories mein sabse sensitive personal data hota hai: account numbers, passwords, diagnoses. Inhe decrypt karne se company ke liye risk banta hai aur security benefit kam, aur ho sakta hai ki law ya aapke employment agreements ise restrict karein. Best practice yeh hai ki in FortiGuard categories ko deep inspection se exempt karo. Built-in deep-inspection profile mein kuch aise exemptions pehle se hote hain, lekin apna profile padho, maan mat lo.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall wildcard-fqdn custom
    edit "NK-UPDATE-HOSTS"
        set wildcard-fqdn "*.updates.example"
    next
end
config firewall ssl-ssh-profile
    edit "NK-DEEP"
        config ssl-exempt
            edit 1
                set type fortiguard-category
                set fortiguard-category 31
            next
            edit 2
                set type fortiguard-category
                set fortiguard-category 33
            next
            edit 3
                set type fortiguard-category
                set fortiguard-category 35
            next
            edit 4
                set type wildcard-fqdn
                set wildcard-fqdn "NK-UPDATE-HOSTS"
            next
            edit 5
                set type address
                set address "PARTNER-ERP-SRV"
            next
        end
        set ssl-exemption-log enable
    next
end</pre>
<p>Categories 31, 33 aur 35 Finance and Banking, Health and Wellness aur Medicine hain. Exemption types: <code>fortiguard-category</code>, <code>address</code> (address object), <code>wildcard-fqdn</code> (host-name patterns) aur <code>regex</code>. Yaad rakho ki exempt site antivirus aur IPS ko bhi nahi dikhti, isliye list chhoti aur reviewed rakho.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Exemption decision">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">Session shuru</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">ClientHello</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">Exempt?</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">category, host, IP</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">Haan</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">sirf certificate level</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.3">Nahi</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.3">deep inspection</text>
</svg><p class="cap">Exemptions session ke shuru mein, kisi decryption se pehle evaluate hote hain.</p></div>

<h3>Technology ke liye exempt: certificate pinning</h3>
<p><b>Certificate pinning</b> ka matlab hai ki application mein ek certificate ya public key built-in hoti hai aur woh koi aur certificate refuse karti hai, FortiGate ka re-signed bhi, chahe device FortiGate CA par trust karta ho. Mobile banking apps, kuch update services, kai cloud sync clients, messaging apps aur kuch developer tools pin karte hain. Pinning ho to deep inspection se application vague connection error ke saath fail hoti hai. Inspection isse solve nahi kar sakta: sahi jawab us application ke servers ke liye (host name, FQDN ya address se) exemption hai. Pinning application ki security feature hai, aapke firewall ki kharabi nahi.</p>
<p>Doosre common exemption candidates: operating-system aur security-product update hosts, client certificates (mutual TLS) use karne wali applications, weak ciphers wale legacy servers jo re-negotiation mein fail hote hain, aur internal servers jahan dono ends aap control karte ho.</p>

<h3>Kya exempt karna hai yeh kaise dhoondhein</h3>
<ol>
<li>Chhote group ke saath deep inspection ka pilot karo.</li>
<li>Helpdesk se woh tickets maango jo kehte hain "app ghar par chalti hai lekin office mein nahi".</li>
<li>SSL logs padho: handshake failures aur anomalies, host name ke saath.</li>
<li>Application ke saath client se test karo, aur application sirf exemption ke saath chale to sabse narrow host pattern jodo jo fix kare.</li>
<li>Har exemption ka reason aur owner record karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Deep inspection enable karne ke baad staff health portal ki HR mobile app login nahi kar paati. App apna certificate pin karti hai. HR portal ka host <code>clinic.example</code> hai, jo Health and Wellness category ki site hai aur category exemption se pehle se covered hai, isliye app doosre host ki wajah se fail ho rahi thi: uski update service <code>cdn.clinic.example</code>. Team ne woh wildcard exempt list mein joda, app chali, aur exemption log mein hits dikhe.</p></div>

<div class="warn"><p><b>Common mistake.</b> "App chalane ke liye" bade cloud provider ke har host jaisa bada wildcard exempt kar dena. Isse hazaaron unrelated services ka inspection hat jaata hai. Logs mein specific host names dhoondho aur sirf wahi exempt karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exemption types: FortiGuard category, address, wildcard FQDN aur regex. Exempt traffic decrypt nahi hota, isliye antivirus, IPS aur URL-path filtering use nahi dekh sakte. Pinned applications exempt hone tak deep inspection mein fail hoti hain.</p></div>

<div class="scn"><h4>Bank aur auditor</h4><p>Internal audit ne poocha: "Kya security team staff ke online banking sessions padh sakti hai?" Profile ke hisaab se sachcha jawab haan tha: clean-up ke dauraan Finance and Banking category exemption delete ho gaya tha. Team ne usi din use restore kiya, document kiya ki banking, health aur personal-privacy categories policy se exempt hain, aur ek quarterly check likha jo live profile ko approved baseline se compare karta hai.</p><p><b>Lesson:</b> sensitive categories design se exempt hoti hain; verify karo, maan mat lo.</p></div>

<div class="iv"><p class="q">"Deep inspection se kaunsa traffic exempt karoge aur kyun?"</p><p>Sensitive categories jaise Finance and Banking aur Health, privacy aur legal wajah se; certificate pinning ya client certificates use karne wali applications, kyunki woh tootti hain; update services aur legacy servers jo re-negotiation mein fail hote hain. Main list narrow, logged, documented aur reviewed rakhta hoon, aur maanta hoon ki exempt traffic scan nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Privacy (banking, health) aur technology (pinning, client certificates, updates) ke liye exempt.</li>
<li>Types: fortiguard-category, address, wildcard-fqdn, regex.</li>
<li>Exempt traffic antivirus, IPS aur URL-path filtering ko invisible hai.</li>
<li>Pinning application ki security feature hai; fix exemption hai.</li>
<li>Exemptions narrow, logged aur reviewed rakho.</li>
</ul></div>
`}};export{e as default};
var e={id:`ca-certificates`,h:{en:`CA certificates: the Fortinet default, your own CA and distribution`,hi:`CA certificates: Fortinet default, apna CA aur distribution`},body:{en:`
<p>Deep inspection stands or falls on one thing: whether the client trusts the CA that signs the FortiGate's re-signed certificates. This chapter is about that CA: which one to use, how to protect it, and how to get it onto devices.</p>

<h3>The default: Fortinet_CA_SSL</h3>
<p>Out of the box the FortiGate has two built-in CA certificates for inspection: <code>Fortinet_CA_SSL</code> (signs copies of valid server certificates) and <code>Fortinet_CA_Untrusted</code> (signs copies of invalid ones). Since no client has trusted them yet, every browser shows a warning. The GUI lets you download the CA certificate so you can install it in client trust stores. The default is fine for a lab and for a pilot; for production there are better options.</p>

<h3>Your own CA: the production choice</h3>
<p>Most organisations already run an internal CA (for example a Windows enterprise CA). Best practice is to have that CA issue a <b>subordinate CA certificate</b> for the FortiGate, with the CA flag set so it can sign other certificates, then import it as a local certificate and select it in the SSL/SSH profile. Because clients already trust the enterprise root, nothing new has to be installed.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code"><span class="c"># after importing the signed subordinate CA as a local certificate "NK-INSPECT-CA"</span>
config firewall ssl-ssh-profile
    edit "NK-DEEP"
        set caname "NK-INSPECT-CA"
        set untrusted-caname "Fortinet_CA_Untrusted"
    next
end
<span class="c"># list local certificates (CLI)</span>
get vpn certificate local</pre>
<p>Use a strong key (RSA 2048 or larger, or an elliptic-curve key), a sensible lifetime, and an obvious name. Record the expiry date in your calendar: when the inspection CA expires, every re-signed certificate becomes invalid and users see warnings.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="CA chain">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Root CA</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">already trusted</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Subordinate CA</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">on the FortiGate</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Re-signed cert</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">per website</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Client</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">trusts the chain</text>
</svg><p class="cap">With an enterprise subordinate CA the chain already ends in a trusted root; nothing extra is installed.</p></div>

<h3>Getting the CA to the devices</h3>
<table class="cmp"><tr><th>Device type</th><th>How</th></tr>
<tr><td>Windows domain PCs</td><td>Group Policy: push the CA into Trusted Root Certification Authorities</td></tr>
<tr><td>macOS, iOS, Android managed</td><td>MDM profile with the CA certificate</td></tr>
<tr><td>Linux and containers</td><td>Add to the system trust bundle, or the application's own store</td></tr>
<tr><td>Browsers with their own store</td><td>Policy setting or manual import (Firefox, some Java stores)</td></tr>
<tr><td>Unmanaged and guest devices</td><td>Do not deep inspect; use certificate inspection</td></tr></table>
<p>After installation, verify from a client: open a secure site and inspect the issuer in the certificate details. It should name your inspection CA, and there should be no warning.</p>

<h3>Protecting the CA key</h3>
<p>The inspection CA private key can sign a certificate for <i>any</i> website. If it leaks, whoever holds it can impersonate every site to every device that trusts the CA. Therefore: restrict administrator access, protect configuration backups (they contain the key unless excluded or encrypted), use a dedicated subordinate CA that can be revoked without touching the rest of your PKI, restrict its issuing constraints where possible, and never reuse the same CA across unrelated organisations.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab issues <code>NK-INSPECT-CA</code> as a subordinate of its enterprise root, valid for three years. Group Policy already distributes the enterprise root to 900 laptops, so on the day deep inspection is enabled no user sees a warning. The helpdesk script for Mac and mobile users uses an MDM profile. In the calendar: renew 60 days before expiry.</p></div>

<div class="warn"><p><b>Common mistake.</b> Telling users to click through the certificate warning "just this once". That trains them to ignore real attacks. Fix the trust chain instead, or leave that device on certificate inspection.</p></div>
<div class="exam"><p><b>Exam trap.</b> Fortinet_CA_SSL signs valid-server copies, Fortinet_CA_Untrusted signs invalid-server copies. A custom inspection CA must be a CA certificate (with the CA flag) so it can sign others. If clients do not trust the signing CA, they get warnings.</p></div>

<div class="scn"><h4>The expired inspection CA</h4><p>Three years after rollout, Monday morning brought hundreds of certificate errors in every browser. Nothing had changed in the firewall policy. The inspection CA had expired over the weekend, so every re-signed certificate chained to an expired CA. The team had no renewal reminder. They issued a new subordinate CA, imported it, selected it in the profile, and pushed the new certificate through Group Policy within hours.</p><p><b>Lesson:</b> a CA lifetime is an operational deadline. Put it in the calendar.</p></div>

<div class="iv"><p class="q">"Which CA would you use for deep inspection in production and why?"</p><p>A subordinate CA issued by the organisation's own enterprise CA, imported on the FortiGate, because clients already trust the enterprise root, access is controlled and the subordinate can be revoked if compromised. The default Fortinet CA is suitable for labs and pilots only. I would also distribute and verify the trust chain and track the expiry date.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fortinet_CA_SSL and Fortinet_CA_Untrusted are the built-in inspection CAs.</li>
<li>Production: a subordinate CA from your enterprise CA, imported as a local certificate.</li>
<li>Distribute through Group Policy, MDM or system trust stores; verify the issuer on a client.</li>
<li>Protect the CA private key and backups; track expiry.</li>
<li>Never teach users to ignore certificate warnings.</li>
</ul></div>
`,hi:`
<p>Deep inspection ek cheez par tika hai: kya client us CA par trust karta hai jo FortiGate ke re-signed certificates sign karta hai. Yeh chapter us CA ke baare mein hai: kaunsa use karein, use kaise protect karein, aur devices tak kaise pahunchayein.</p>

<h3>Default: Fortinet_CA_SSL</h3>
<p>Out of the box FortiGate ke paas inspection ke liye do built-in CA certificates hote hain: <code>Fortinet_CA_SSL</code> (valid server certificates ke copies sign karta hai) aur <code>Fortinet_CA_Untrusted</code> (invalid wale ke copies sign karta hai). Kyunki kisi client ne unpar trust nahi kiya, har browser warning dikhata hai. GUI se CA certificate download karke client trust stores mein install kar sakte ho. Default lab aur pilot ke liye theek hai; production ke liye behtar options hain.</p>

<h3>Apna CA: production choice</h3>
<p>Zyadatar organisations ke paas pehle se internal CA hota hai (jaise Windows enterprise CA). Best practice yeh hai ki woh CA FortiGate ke liye <b>subordinate CA certificate</b> issue kare, CA flag set ke saath taaki woh doosre certificates sign kar sake, phir use local certificate ke roop mein import karke SSL/SSH profile mein select karo. Kyunki clients pehle se enterprise root par trust karte hain, kuch naya install nahi karna padta.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code"><span class="c"># signed subordinate CA ko local certificate "NK-INSPECT-CA" ke roop mein import karne ke baad</span>
config firewall ssl-ssh-profile
    edit "NK-DEEP"
        set caname "NK-INSPECT-CA"
        set untrusted-caname "Fortinet_CA_Untrusted"
    next
end
<span class="c"># local certificates list (CLI)</span>
get vpn certificate local</pre>
<p>Strong key use karo (RSA 2048 ya bada, ya elliptic-curve key), sensible lifetime, aur obvious naam. Expiry date calendar mein daalo: jab inspection CA expire hota hai, har re-signed certificate invalid ho jaata hai aur users ko warnings dikhti hain.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="CA chain">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Root CA</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">pehle se trusted</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Subordinate CA</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">FortiGate par</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Re-signed cert</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">har website ke liye</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Client</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">chain par trust</text>
</svg><p class="cap">Enterprise subordinate CA ke saath chain pehle se trusted root par khatam hoti hai; kuch extra install nahi karna.</p></div>

<h3>CA ko devices tak pahunchana</h3>
<table class="cmp"><tr><th>Device type</th><th>Kaise</th></tr>
<tr><td>Windows domain PCs</td><td>Group Policy: CA ko Trusted Root Certification Authorities mein push karo</td></tr>
<tr><td>macOS, iOS, Android managed</td><td>CA certificate ke saath MDM profile</td></tr>
<tr><td>Linux aur containers</td><td>System trust bundle mein jodo, ya application ke apne store mein</td></tr>
<tr><td>Apne store wale browsers</td><td>Policy setting ya manual import (Firefox, kuch Java stores)</td></tr>
<tr><td>Unmanaged aur guest devices</td><td>Deep inspect mat karo; certificate inspection use karo</td></tr></table>
<p>Install ke baad client se verify karo: secure site kholo aur certificate details mein issuer dekho. Woh aapke inspection CA ka naam dikhaye, aur koi warning nahi honi chahiye.</p>

<h3>CA key ki suraksha</h3>
<p>Inspection CA ki private key <i>kisi bhi</i> website ka certificate sign kar sakti hai. Leak ho jaaye to jiske paas hai woh us CA par trust karne wale har device ko har site ki tarah impersonate kar sakta hai. Isliye: administrator access restrict karo, configuration backups protect karo (unme key hoti hai jab tak exclude ya encrypt na ho), dedicated subordinate CA use karo jo baaki PKI chhue bina revoke ho sake, jahan possible ho issuing constraints restrict karo, aur alag organisations ke beech same CA kabhi reuse mat karo.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab apne enterprise root ka subordinate <code>NK-INSPECT-CA</code> issue karta hai, teen saal valid. Group Policy pehle se 900 laptops par enterprise root distribute karti hai, isliye deep inspection enable hone ke din kisi user ko warning nahi dikhti. Mac aur mobile users ke liye helpdesk script MDM profile use karti hai. Calendar mein: expiry se 60 din pehle renew.</p></div>

<div class="warn"><p><b>Common mistake.</b> Users ko kehna ki certificate warning par "bas is baar" click karke aage badho. Isse woh asli attacks ko ignore karna seekhte hain. Trust chain theek karo, ya us device ko certificate inspection par rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Fortinet_CA_SSL valid-server copies sign karta hai, Fortinet_CA_Untrusted invalid-server copies. Custom inspection CA ek CA certificate hona chahiye (CA flag ke saath) taaki doosre sign kar sake. Clients signing CA par trust na karein to warnings aati hain.</p></div>

<div class="scn"><h4>Expired inspection CA</h4><p>Rollout ke teen saal baad Monday subah har browser mein saikdon certificate errors aaye. Firewall policy mein kuch nahi badla tha. Inspection CA weekend mein expire ho gaya tha, isliye har re-signed certificate expired CA se chain hota tha. Team ke paas renewal reminder nahi tha. Unhone naya subordinate CA issue kiya, import kiya, profile mein select kiya, aur naya certificate ghanton mein Group Policy se push kiya.</p><p><b>Lesson:</b> CA ki lifetime operational deadline hai. Use calendar mein rakho.</p></div>

<div class="iv"><p class="q">"Production mein deep inspection ke liye kaunsa CA use karoge aur kyun?"</p><p>Organisation ke apne enterprise CA se issue hua subordinate CA, FortiGate par import kiya hua, kyunki clients pehle se enterprise root par trust karte hain, access controlled hai aur compromise hone par subordinate revoke ho sakta hai. Default Fortinet CA sirf labs aur pilots ke liye hai. Main trust chain distribute aur verify karunga aur expiry date track karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fortinet_CA_SSL aur Fortinet_CA_Untrusted built-in inspection CAs hain.</li>
<li>Production: enterprise CA se subordinate CA, local certificate ke roop mein import.</li>
<li>Group Policy, MDM ya system trust stores se distribute; client par issuer verify karo.</li>
<li>CA private key aur backups protect karo; expiry track karo.</li>
<li>Users ko certificate warnings ignore karna kabhi mat sikhao.</li>
</ul></div>
`}};export{e as default};
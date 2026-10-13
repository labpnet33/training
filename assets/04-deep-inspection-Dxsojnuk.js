var e={id:`deep-inspection`,h:{en:`Deep inspection: decrypting, inspecting and re-encrypting`,hi:`Deep inspection: decrypt, inspect aur re-encrypt`},body:{en:`
<p>Deep inspection is the strongest level and the one that needs the most care. The FortiGate becomes an authorised <b>intermediary</b>: it terminates the client's TLS session, opens its own TLS session to the real server, inspects the plain text between them, and presents the client with a certificate it created on the fly. This is the same technique an attacker would use, which is why it must only ever be used with consent, on your own network, and with strict control of the signing key.</p>

<h3>How the two sessions work</h3>
<ol>
<li>The client sends ClientHello for <code>news.example</code>.</li>
<li>The FortiGate connects to <code>news.example</code>, receives the real certificate and <b>validates it</b> (chain, dates, name, revocation).</li>
<li>If valid, the FortiGate generates a copy of the certificate with the same names, <b>signed by its CA certificate</b> (<code>caname</code>), and presents that to the client.</li>
<li>If the real certificate is not valid, the FortiGate signs the copy with a different, deliberately <b>untrusted CA</b> (<code>untrusted-caname</code>), so the client sees a warning and the user is not fooled into trusting a bad site.</li>
<li>Plain text flows through the engines: antivirus, IPS, web filter, application control and data-leak rules. The FortiGate then re-encrypts toward both sides.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Deep inspection sessions">
<rect x="20" y="25" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.5">Client</text><text x="112.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.5">trusts FortiGate CA</text><line x1="205" y1="60" x2="227" y2="60" stroke="#64748b" stroke-width="2"/><path d="M221 55 L227 60 L221 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="227" y="25" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.5">FortiGate</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.5">decrypt, inspect, re-encrypt</text><line x1="412" y1="60" x2="434" y2="60" stroke="#64748b" stroke-width="2"/><path d="M428 55 L434 60 L428 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="434" y="25" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.5">Server</text><text x="526.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.5">real certificate</text>
</svg><p class="cap">Two separate TLS sessions with plaintext inspection in the middle. The client sees a certificate signed by the FortiGate CA.</p></div>

<h3>Configuring deep inspection</h3>
<p>The built-in <code>deep-inspection</code> profile is read-only and uses the default Fortinet CA. You normally clone it (for example <code>custom-deep-inspection</code> or your own name) so you can choose the CA and exemptions.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall ssl-ssh-profile
    edit "NK-DEEP"
        set comment "Managed staff laptops: deep inspection"
        config h&#116;tps
            set ports 443
            set status deep-inspection
            set untrusted-server-cert allow
        end
        config ftps
            set status deep-inspection
        end
        config imaps
            set status deep-inspection
        end
        config smtps
            set status deep-inspection
        end
        config ssh
            set ports 22
            set status disable
        end
        set caname "Fortinet_CA_SSL"
        set untrusted-caname "Fortinet_CA_Untrusted"
        set ssl-exemption-log enable
        set ssl-anomaly-log enable
    next
end</pre>
<p>Settings to know:</p>
<ul>
<li><b>ports and status</b> per protocol: the secure web protocol, FTPS, IMAPS, POP3S, SMTPS, and SSH. <code>deep-inspection</code>, <code>certificate-inspection</code> or <code>disable</code> can differ per protocol.</li>
<li><b>inspect-all</b> (in the <code>ssl</code> section): inspect all ports, not just the listed ones, so encrypted traffic on non-standard ports is not ignored.</li>
<li><b>caname / untrusted-caname</b>: which CA certificate signs good-server and bad-server copies.</li>
<li><b>SSH inspection</b>: can inspect SSH sessions for exec, port-forward, X11 and file transfer behaviour and block selected channel types; it is a separate control from TLS.</li>
</ul>

<h3>Cost and behaviour changes</h3>
<p>Because the FortiGate is now an endpoint, several things change. TLS versions and ciphers are negotiated separately on each side. Client certificates (mutual TLS) cannot pass through as-is. Some applications break. CPU use increases, especially for TLS 1.3 and large downloads. Models with dedicated crypto hardware cope better. Policy mode also matters: flow-based and proxy-based inspection both support deep inspection, but proxy mode can handle more features and uses more memory.</p>

<div class="eg"><p><b>Worked example.</b> Managed laptop 10.0.1.10 downloads a document from <code>files.example</code>. The FortiGate validates the real certificate, presents a copy signed by <code>Fortinet_CA_SSL</code>, and the laptop (which trusts that CA) shows a normal padlock. The decrypted file is passed to antivirus, a known-bad test file is detected, the download is blocked with a replacement message, and the log records the file and the action. Without deep inspection this file would have crossed the firewall unseen.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using the default Fortinet CA on production for browsers that will receive warnings. Also: deep-inspecting everything, including banking and healthcare. Follow chapter 6 and exempt sensitive categories, and chapter 7 for consent and legal basis.</p></div>
<div class="exam"><p><b>Exam trap.</b> In deep inspection the FortiGate re-signs server certificates with the CA named in <code>caname</code>; invalid server certificates are re-signed with the <code>untrusted-caname</code> CA so users still see a warning. Clients must trust the CA used for good certificates.</p></div>

<div class="scn"><h4>The download that finally got caught</h4><p>A finance team in Pune kept receiving a malicious invoice archive from a file-sharing site over an encrypted connection. Antivirus was on the policy but never fired. After the staff policy changed from certificate inspection to deep inspection with the company CA installed on managed laptops, the next attempt was detected and blocked, and the log showed the exact file name and source.</p><p><b>Lesson:</b> a profile cannot detect what it cannot read.</p></div>

<div class="iv"><p class="q">"Explain how deep inspection works technically."</p><p>The FortiGate terminates the client's TLS session and opens a second one to the real server, validating the real certificate. It issues a copy of the certificate signed by its configured CA, which clients must trust. Plaintext flows through antivirus, IPS, web filter and application control, then is re-encrypted. If the real certificate is bad, the copy is signed with an untrusted CA so the user sees a warning.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deep inspection means two TLS sessions with plaintext inspection in the middle.</li>
<li>Good server certificates are re-signed with caname; bad ones with untrusted-caname.</li>
<li>Per-protocol status: secure web, FTPS, IMAPS, POP3S, SMTPS, SSH.</li>
<li>Use inspect-all to cover non-standard ports.</li>
<li>Costs: CPU, memory, application compatibility and obligations.</li>
</ul></div>
`,hi:`
<p>Deep inspection sabse strong level hai aur sabse zyada care maangta hai. FortiGate ek authorised <b>intermediary</b> ban jaata hai: woh client ka TLS session terminate karta hai, asli server se apna TLS session kholta hai, dono ke beech plain text inspect karta hai, aur client ko aisa certificate dikhata hai jo usne turant banaya. Yeh wahi technique hai jo attacker use karega, isiliye ise sirf consent ke saath, apne network par, aur signing key ke strict control ke saath use karna chahiye.</p>

<h3>Do sessions kaise kaam karte hain</h3>
<ol>
<li>Client <code>news.example</code> ke liye ClientHello bhejta hai.</li>
<li>FortiGate <code>news.example</code> se connect karta hai, asli certificate leta hai aur use <b>validate karta hai</b> (chain, dates, name, revocation).</li>
<li>Valid ho to FortiGate wahi names wala certificate ka copy banata hai, jo uske <b>CA certificate se sign</b> hota hai (<code>caname</code>), aur client ko dikhata hai.</li>
<li>Asli certificate valid na ho to FortiGate copy ko doosri, jaanboojhkar <b>untrusted CA</b> (<code>untrusted-caname</code>) se sign karta hai, taaki client ko warning dikhe aur user kharab site par trust karne se bache.</li>
<li>Plain text engines se guzarta hai: antivirus, IPS, web filter, application control aur data-leak rules. Phir FortiGate dono taraf re-encrypt karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Deep inspection sessions">
<rect x="20" y="25" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.5">Client</text><text x="112.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.5">FortiGate CA par trust</text><line x1="205" y1="60" x2="227" y2="60" stroke="#64748b" stroke-width="2"/><path d="M221 55 L227 60 L221 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="227" y="25" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.5">FortiGate</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.5">decrypt, inspect, re-encrypt</text><line x1="412" y1="60" x2="434" y2="60" stroke="#64748b" stroke-width="2"/><path d="M428 55 L434 60 L428 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="434" y="25" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="54" text-anchor="middle" class="svg-ink" font-size="12.5">Server</text><text x="526.5" y="72" text-anchor="middle" class="svg-muted" font-size="11.5">asli certificate</text>
</svg><p class="cap">Do alag TLS sessions, beech mein plaintext inspection. Client ko FortiGate CA se sign hua certificate dikhta hai.</p></div>

<h3>Deep inspection configure karna</h3>
<p>Built-in <code>deep-inspection</code> profile read-only hai aur default Fortinet CA use karta hai. Aam taur par aap use clone karte ho (jaise <code>custom-deep-inspection</code> ya apna naam) taaki CA aur exemptions chun sako.</p>
<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config firewall ssl-ssh-profile
    edit "NK-DEEP"
        set comment "Managed staff laptops: deep inspection"
        config h&#116;tps
            set ports 443
            set status deep-inspection
            set untrusted-server-cert allow
        end
        config ftps
            set status deep-inspection
        end
        config imaps
            set status deep-inspection
        end
        config smtps
            set status deep-inspection
        end
        config ssh
            set ports 22
            set status disable
        end
        set caname "Fortinet_CA_SSL"
        set untrusted-caname "Fortinet_CA_Untrusted"
        set ssl-exemption-log enable
        set ssl-anomaly-log enable
    next
end</pre>
<p>Jaanne wale settings:</p>
<ul>
<li>Har protocol ke liye <b>ports aur status</b>: secure web protocol, FTPS, IMAPS, POP3S, SMTPS aur SSH. <code>deep-inspection</code>, <code>certificate-inspection</code> ya <code>disable</code> protocol ke hisaab se alag ho sakte hain.</li>
<li><b>inspect-all</b> (<code>ssl</code> section mein): sirf listed ports nahi, saare ports inspect karo, taaki non-standard ports par encrypted traffic ignore na ho.</li>
<li><b>caname / untrusted-caname</b>: kaunsa CA certificate good-server aur bad-server copies sign karta hai.</li>
<li><b>SSH inspection</b>: SSH sessions ko exec, port-forward, X11 aur file transfer behaviour ke liye inspect kar sakta hai aur selected channel types block kar sakta hai; yeh TLS se alag control hai.</li>
</ul>

<h3>Cost aur behaviour changes</h3>
<p>FortiGate ab endpoint hai, isliye kai cheezein badalti hain. TLS versions aur ciphers har taraf alag negotiate hote hain. Client certificates (mutual TLS) jaise ke taise pass nahi ho sakte. Kuch applications tootti hain. CPU use badhta hai, khaaskar TLS 1.3 aur badi downloads par. Dedicated crypto hardware wale models behtar handle karte hain. Policy mode bhi matter karta hai: flow-based aur proxy-based dono deep inspection support karte hain, lekin proxy mode zyada features handle karta hai aur zyada memory leta hai.</p>

<div class="eg"><p><b>Worked example.</b> Managed laptop 10.0.1.10 <code>files.example</code> se document download karta hai. FortiGate asli certificate validate karta hai, <code>Fortinet_CA_SSL</code> se sign kiya copy dikhata hai, aur laptop (jo us CA par trust karta hai) normal padlock dikhata hai. Decrypted file antivirus ko jaati hai, known-bad test file detect hoti hai, download replacement message ke saath block hoti hai, aur log file aur action record karta hai. Deep inspection ke bina yeh file firewall se bina dikhe nikal jaati.</p></div>

<div class="warn"><p><b>Common mistake.</b> Production mein default Fortinet CA use karna jabki browsers warnings dikhayenge. Aur: banking aur healthcare samet sab kuch deep-inspect karna. Chapter 6 follow karke sensitive categories exempt karo, aur consent aur legal basis ke liye chapter 7.</p></div>
<div class="exam"><p><b>Exam trap.</b> Deep inspection mein FortiGate server certificates ko <code>caname</code> mein diye CA se re-sign karta hai; invalid server certificates <code>untrusted-caname</code> CA se re-sign hote hain taaki users ko phir bhi warning dikhe. Good certificates ke liye use hone wale CA ko clients ko trust karna zaroori hai.</p></div>

<div class="scn"><h4>Download jo aakhirkaar pakdi gayi</h4><p>Pune ki finance team ko file-sharing site se encrypted connection par baar baar malicious invoice archive milta tha. Policy par antivirus tha lekin kabhi fire nahi hua. Staff policy certificate inspection se deep inspection par badli aur managed laptops par company CA install hua, to agli koshish detect aur block hui, aur log ne exact file name aur source dikhaya.</p><p><b>Lesson:</b> profile woh detect nahi kar sakta jo woh padh nahi sakta.</p></div>

<div class="iv"><p class="q">"Deep inspection technically kaise kaam karta hai samjhao."</p><p>FortiGate client ka TLS session terminate karta hai aur asli server se doosra session kholta hai, asli certificate validate karte hue. Woh apne configured CA se sign kiya certificate ka copy issue karta hai, jise clients ko trust karna hota hai. Plaintext antivirus, IPS, web filter aur application control se guzarta hai, phir re-encrypt hota hai. Asli certificate kharab ho to copy untrusted CA se sign hoti hai taaki user ko warning dikhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Deep inspection matlab do TLS sessions, beech mein plaintext inspection.</li>
<li>Good server certificates caname se re-sign; bad wale untrusted-caname se.</li>
<li>Protocol ke hisaab se status: secure web, FTPS, IMAPS, POP3S, SMTPS, SSH.</li>
<li>Non-standard ports cover karne ke liye inspect-all use karo.</li>
<li>Costs: CPU, memory, application compatibility aur obligations.</li>
</ul></div>
`}};export{e as default};
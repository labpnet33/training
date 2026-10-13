var e={id:`reading-errors`,h:{en:`Reading every no: status line, code and Python exception`,hi:`Har na ko padhna: status line, code aur Python exception`},body:{en:`
<p>When a PAN-OS call fails, the answer to "why" is in one of three places, and you read them in order. First the <b>H&#84;TP status</b>: did the request even reach the API? Then the <b>code</b> and <code>msg</code> in the reply body. Then, if you use pan-os-python, the <b>Python exception</b> that wraps both. Most wasted hours come from looking at the wrong layer.</p>

<div class="dia"><svg viewBox="0 0 640 184" role="img" aria-label="diagram">
<rect x="8" y="14" width="190" height="44" rx="10" fill="#fecaca"/><text x="103" y="33" text-anchor="middle" class="svg-ink" font-size="13">H&#84;TP 403</text><text x="103" y="50" text-anchor="middle" class="svg-muted" font-size="11">key or password is wrong</text>
<rect x="8" y="70" width="190" height="44" rx="10" fill="#fde68a"/><text x="103" y="89" text-anchor="middle" class="svg-ink" font-size="13">code 16</text><text x="103" y="106" text-anchor="middle" class="svg-muted" font-size="11">key fine, role read-only</text>
<rect x="8" y="126" width="190" height="44" rx="10" fill="#fed7aa"/><text x="103" y="145" text-anchor="middle" class="svg-ink" font-size="13">code 12</text><text x="103" y="162" text-anchor="middle" class="svg-muted" font-size="11">bad xpath, value or reference</text>
<rect x="224" y="14" width="190" height="44" rx="10" fill="#fed7aa"/><text x="319" y="33" text-anchor="middle" class="svg-ink" font-size="13">code 10</text><text x="319" y="50" text-anchor="middle" class="svg-muted" font-size="11">delete blocked by a reference</text>
<rect x="224" y="70" width="190" height="44" rx="10" fill="#ddd6fe"/><text x="319" y="89" text-anchor="middle" class="svg-ink" font-size="13">code 13</text><text x="319" y="106" text-anchor="middle" class="svg-muted" font-size="11">nothing to commit (not an error)</text>
<rect x="224" y="126" width="190" height="44" rx="10" fill="#fecaca"/><text x="319" y="145" text-anchor="middle" class="svg-ink" font-size="13">job FIN FAIL</text><text x="319" y="162" text-anchor="middle" class="svg-muted" font-size="11">validation at commit time</text>
<rect x="440" y="14" width="192" height="44" rx="10" fill="#e2e8f0"/><text x="536" y="33" text-anchor="middle" class="svg-ink" font-size="13">PanDeviceXapiError</text><text x="536" y="50" text-anchor="middle" class="svg-muted" font-size="11">codes 403, 16, 12, 10</text>
<rect x="440" y="70" width="192" height="44" rx="10" fill="#e2e8f0"/><text x="536" y="89" text-anchor="middle" class="svg-ink" font-size="13">PanCommitFailed</text><text x="536" y="106" text-anchor="middle" class="svg-muted" font-size="11">only with exception=True</text>
<rect x="440" y="126" width="192" height="44" rx="10" fill="#e2e8f0"/><text x="536" y="145" text-anchor="middle" class="svg-ink" font-size="13">PanConnectionTimeout</text><text x="536" y="162" text-anchor="middle" class="svg-muted" font-size="11">port closed or dropped</text>
</svg><p class="cap">Three layers of "no": the H&#84;TP status, the code in the body, and the Python exception.</p></div>

<h3>The codes you will meet</h3>
<table class="cmp"><tr><th>You see</th><th>Means</th><th>First thing to check</th></tr>
<tr><td>H&#84;TP 403, "Invalid Credential"</td><td>Key or password rejected</td><td>Key age, a stale <code>.env</code></td></tr>
<tr><td>code 16</td><td>Key is valid, role cannot do this</td><td>Admin role of the key's account</td></tr>
<tr><td>code 12</td><td>Bad xpath, bad value or broken reference</td><td>Spelling of the name in the message</td></tr>
<tr><td>code 10</td><td>Delete refused, still referenced</td><td>The referrer named in the message</td></tr>
<tr><td>code 13</td><td>Nothing to commit</td><td>Not an error: skip the job step</td></tr>
<tr><td>code 7</td><td>Empty result</td><td>Does the object exist? candidate or running?</td></tr>
<tr><td>job FIN FAIL</td><td>Commit validation failed</td><td>The details lines of the job</td></tr></table>
<p>Most of these arrive with <b>H&#84;TP 200</b>. A script that tests only the H&#84;TP status will call a rejected delete a success. Always parse the body. The two cases where H&#84;TP itself is the verdict are bad credentials (403) and a request that never connects.</p>

<h3>The same failures through pan-os-python</h3>
<p>The library turns codes into exceptions. <code>errors.py</code> triggers eleven cases and prints each. The helper catches the classes in order from specific to general:</p>
<pre class="code">def attempt(label, fn):
    try:
        print("%-24s ok: %s" % (label, fn()))
    except panos.PanObjectMissing as e:
        print("%-24s PanObjectMissing: %s" % (label, str(e)[:60]))
    except panos.PanConnectionTimeout as e:
        print("%-24s PanConnectionTimeout: %s" % (label, e))
    except panos.PanURLError as e:
        print("%-24s PanURLError: %s" % (label, e))
    except panos.PanDeviceXapiError as e:
        print("%-24s PanDeviceXapiError: %s" % (label, e))
</pre>
<pre class="out">AUTO01$ python3 errors.py
<span class="hl">wrong password           PanDeviceXapiError: Invalid credentials.</span>
<span class="hl">wrong api key            PanDeviceXapiError: Invalid Credential</span>
no such host             PanConnectionTimeout: URLError: &lt;urlopen error timed out&gt;
missing object           PanObjectMissing: Object doesn't exist: /config/devices/entry[@name='localhost
<span class="hl">rule -&gt; missing address  PanDeviceXapiError: rulebase -&gt; security -&gt; rules -&gt; bad destination 'ghost' is not a valid reference, Edit breaks config validity</span>
create address           ok: AddressObject: srv
create address again     ok: AddressObject: srv
rule -&gt; srv              ok: SecurityRule: ok
<span class="hl">delete address in use    PanDeviceXapiError: srv cannot be deleted because of references from:, rulebase -&gt; security -&gt; rules -&gt; ok destination</span>
create other             ok: AddressObject: other
<span class="hl">rename onto existing     PanDeviceXapiError: other is not unique</span></pre>
<p>Read it line by line. A wrong password and a wrong key both give <code>PanDeviceXapiError</code> with an invalid-credential message. A missing object is its own class, <code>PanObjectMissing</code>, which is useful: "not there" is often the answer you wanted. A rule that points to a missing address, and the delete of an address still in use, are both <code>PanDeviceXapiError</code>, and the text carries the code 12 and code 10 messages from earlier chapters. Creating an address that already exists is <b>not</b> an error, it merges. Renaming onto an existing name is refused ("is not unique").</p>

<h3>The silent one: timeouts</h3>
<p>The host <code>10.99.0.43</code> does not exist, so nothing answers. The result is <code>PanConnectionTimeout</code>, not an API code, because there is no reply to carry one. To see it against the real firewall, h&#116;tps was switched off on its management profile and the same call repeated:</p>
<pre class="out">[P1] set network profiles interface-management-profile mgmt h&#116;tps no
[P1] commit
Configuration committed successfully

$ python3 timeout.py
PanConnectionTimeout: URLError: &lt;urlopen error timed out&gt;</pre>
<p>A timeout says "no answer": routing, a firewall in the path, a closed management service, or a wrong address. It tells you nothing about keys or roles, so do not rotate keys when you see it. Set <code>timeout=</code> on the Firewall object so that a dead host fails in seconds and not in the default wait.</p>

<div class="warn"><p><b>Common mistakes.</b> Testing only the H&#84;TP status. Rotating the key after a timeout. Catching <code>Exception</code> and printing nothing. Printing the full exception from a request that carries the key in a header or URL. Retrying a code 12 or 10 error, which will fail the same way every time.</p></div>
<div class="exam"><p><b>Exam trap.</b> 403 is "who are you" (key or password) and code 16 is "you may not". A valid key with a read-only role gets H&#84;TP 200 and code 16. Timeout is neither: nobody answered.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The numeric codes and the exception classes are those the real API and library use, but the message wording in the lab is simplified. Real PAN-OS has other codes (for example 17 for an invalid command and 3 for a missing parameter), and a commit lock produces its own error.</p></div>

<div class="scn"><h4>"The key is bad" that was a firewall rule</h4><p>A script began failing every morning at 9 with a timeout. Two people regenerated the key, which changed nothing. The cause was a security policy on a firewall in the path that blocked the management subnet during office hours. The error never said "credential".</p><p><b>Lesson:</b> a timeout is a path problem. Read the layer before you act.</p></div>

<div class="iv"><p class="q">"An API call returned H&#84;TP 200 but the change is not there. What do you do?"</p><p>I read the body, because PAN-OS puts the real verdict in the <code>status</code> attribute and the code. I match the code against what I know: 12 for a bad xpath or reference, 10 for a blocked delete, 16 for a role problem. Then I fix that one thing; I do not retry blindly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read three layers: H&#84;TP status, body code and message, Python exception.</li>
<li>403 is a credential, code 16 a role, code 12 a bad name or value, code 10 a blocked delete.</li>
<li>Code 13 and an empty code 7 reply are not failures.</li>
<li>Most failures return H&#84;TP 200; always parse the body.</li>
<li>A timeout means no answer; look at the network and the management service, not the key.</li>
</ul></div>
`,hi:`
<p>PAN-OS call fail ho to "kyun" ka jawab teen jagah mein se ek mein hota hai, aur aap unhe kram se padhte ho. Pehle <b>H&#84;TP status</b>: request API tak pahunchi bhi? Phir reply body ka <b>code</b> aur <code>msg</code>. Phir, pan-os-python use karo to, woh <b>Python exception</b> jo dono ko lapete hai. Zyadatar barbaad ghante galat layer dekhne se aate hain.</p>

<div class="dia"><svg viewBox="0 0 640 184" role="img" aria-label="diagram">
<rect x="8" y="14" width="190" height="44" rx="10" fill="#fecaca"/><text x="103" y="33" text-anchor="middle" class="svg-ink" font-size="13">H&#84;TP 403</text><text x="103" y="50" text-anchor="middle" class="svg-muted" font-size="11">key ya password galat</text>
<rect x="8" y="70" width="190" height="44" rx="10" fill="#fde68a"/><text x="103" y="89" text-anchor="middle" class="svg-ink" font-size="13">code 16</text><text x="103" y="106" text-anchor="middle" class="svg-muted" font-size="11">key theek, role read-only</text>
<rect x="8" y="126" width="190" height="44" rx="10" fill="#fed7aa"/><text x="103" y="145" text-anchor="middle" class="svg-ink" font-size="13">code 12</text><text x="103" y="162" text-anchor="middle" class="svg-muted" font-size="11">galat xpath, value ya reference</text>
<rect x="224" y="14" width="190" height="44" rx="10" fill="#fed7aa"/><text x="319" y="33" text-anchor="middle" class="svg-ink" font-size="13">code 10</text><text x="319" y="50" text-anchor="middle" class="svg-muted" font-size="11">delete reference se ruka</text>
<rect x="224" y="70" width="190" height="44" rx="10" fill="#ddd6fe"/><text x="319" y="89" text-anchor="middle" class="svg-ink" font-size="13">code 13</text><text x="319" y="106" text-anchor="middle" class="svg-muted" font-size="11">commit ke liye kuch nahi (error nahi)</text>
<rect x="224" y="126" width="190" height="44" rx="10" fill="#fecaca"/><text x="319" y="145" text-anchor="middle" class="svg-ink" font-size="13">job FIN FAIL</text><text x="319" y="162" text-anchor="middle" class="svg-muted" font-size="11">commit ke waqt validation</text>
<rect x="440" y="14" width="192" height="44" rx="10" fill="#e2e8f0"/><text x="536" y="33" text-anchor="middle" class="svg-ink" font-size="13">PanDeviceXapiError</text><text x="536" y="50" text-anchor="middle" class="svg-muted" font-size="11">codes 403, 16, 12, 10</text>
<rect x="440" y="70" width="192" height="44" rx="10" fill="#e2e8f0"/><text x="536" y="89" text-anchor="middle" class="svg-ink" font-size="13">PanCommitFailed</text><text x="536" y="106" text-anchor="middle" class="svg-muted" font-size="11">sirf exception=True ke saath</text>
<rect x="440" y="126" width="192" height="44" rx="10" fill="#e2e8f0"/><text x="536" y="145" text-anchor="middle" class="svg-ink" font-size="13">PanConnectionTimeout</text><text x="536" y="162" text-anchor="middle" class="svg-muted" font-size="11">port band ya drop</text>
</svg><p class="cap">"Na" ki teen layers: H&#84;TP status, body ka code aur Python exception.</p></div>

<h3>Jo codes aapko milenge</h3>
<table class="cmp"><tr><th>Dikhta hai</th><th>Matlab</th><th>Pehle kya dekho</th></tr>
<tr><td>H&#84;TP 403, "Invalid Credential"</td><td>Key ya password reject</td><td>Key ki umar, stale <code>.env</code></td></tr>
<tr><td>code 16</td><td>Key valid hai, role yeh nahi kar sakta</td><td>Key wale account ka admin role</td></tr>
<tr><td>code 12</td><td>Galat xpath, galat value ya toota reference</td><td>Message mein diye naam ki spelling</td></tr>
<tr><td>code 10</td><td>Delete refuse, abhi referenced hai</td><td>Message mein naam wala referrer</td></tr>
<tr><td>code 13</td><td>Commit karne ko kuch nahi</td><td>Error nahi: job step chhod do</td></tr>
<tr><td>code 7</td><td>Khaali result</td><td>Object hai? candidate ya running?</td></tr>
<tr><td>job FIN FAIL</td><td>Commit validation fail</td><td>Job ki details lines</td></tr></table>
<p>Inme se zyadatar <b>H&#84;TP 200</b> ke saath aate hain. Sirf H&#84;TP status test karne wali script rejected delete ko success bol degi. Body hamesha parse karo. Jin do cases mein H&#84;TP khud verdict hai: galat credentials (403) aur woh request jo kabhi connect hi nahi hui.</p>

<h3>Wahi failures pan-os-python se</h3>
<p>Library codes ko exceptions mein badalti hai. <code>errors.py</code> gyarah cases trigger karti hai aur har ek print karti hai. Helper classes ko specific se general kram mein pakadta hai:</p>
<pre class="code">def attempt(label, fn):
    try:
        print("%-24s ok: %s" % (label, fn()))
    except panos.PanObjectMissing as e:
        print("%-24s PanObjectMissing: %s" % (label, str(e)[:60]))
    except panos.PanConnectionTimeout as e:
        print("%-24s PanConnectionTimeout: %s" % (label, e))
    except panos.PanURLError as e:
        print("%-24s PanURLError: %s" % (label, e))
    except panos.PanDeviceXapiError as e:
        print("%-24s PanDeviceXapiError: %s" % (label, e))
</pre>
<pre class="out">AUTO01$ python3 errors.py
<span class="hl">wrong password           PanDeviceXapiError: Invalid credentials.</span>
<span class="hl">wrong api key            PanDeviceXapiError: Invalid Credential</span>
no such host             PanConnectionTimeout: URLError: &lt;urlopen error timed out&gt;
missing object           PanObjectMissing: Object doesn't exist: /config/devices/entry[@name='localhost
<span class="hl">rule -&gt; missing address  PanDeviceXapiError: rulebase -&gt; security -&gt; rules -&gt; bad destination 'ghost' is not a valid reference, Edit breaks config validity</span>
create address           ok: AddressObject: srv
create address again     ok: AddressObject: srv
rule -&gt; srv              ok: SecurityRule: ok
<span class="hl">delete address in use    PanDeviceXapiError: srv cannot be deleted because of references from:, rulebase -&gt; security -&gt; rules -&gt; ok destination</span>
create other             ok: AddressObject: other
<span class="hl">rename onto existing     PanDeviceXapiError: other is not unique</span></pre>
<p>Line ba line padho. Galat password aur galat key dono invalid-credential message ke saath <code>PanDeviceXapiError</code> dete hain. Gayab object ki apni class hai, <code>PanObjectMissing</code>, jo kaam ki hai: "wahan nahi hai" aksar wahi jawab hota hai jo aap chahte the. Missing address ko point karta rule, aur use mein aaye address ka delete, dono <code>PanDeviceXapiError</code> hain, aur text mein pichhle chapters ke code 12 aur code 10 wale messages hain. Maujood address ko dobara create karna error <b>nahi</b> hai, woh merge hota hai. Maujooda naam par rename refuse hota hai ("is not unique").</p>

<h3>Khamosh wala: timeouts</h3>
<p>Host <code>10.99.0.43</code> maujood hi nahi, isliye koi jawab nahi deta. Natija <code>PanConnectionTimeout</code> hai, API code nahi, kyunki code le jaane wala reply hi nahi hai. Asli firewall par ise dekhne ke liye uske management profile par h&#116;tps band kiya gaya aur wahi call dohrayi gayi:</p>
<pre class="out">[P1] set network profiles interface-management-profile mgmt h&#116;tps no
[P1] commit
Configuration committed successfully

$ python3 timeout.py
PanConnectionTimeout: URLError: &lt;urlopen error timed out&gt;</pre>
<p>Timeout kehta hai "jawab nahi aaya": routing, raaste mein koi firewall, band management service, ya galat address. Yeh keys ya roles ke baare mein kuch nahi batata, isliye timeout par key rotate mat karo. Firewall object par <code>timeout=</code> set karo taaki mara hua host seconds mein fail ho, default wait mein nahi.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Sirf H&#84;TP status test karna. Timeout ke baad key rotate karna. <code>Exception</code> pakad kar kuch print na karna. Aisi request ka poora exception print karna jisme key header ya URL mein hai. Code 12 ya 10 error ko retry karna, jo har baar waise hi fail hoga.</p></div>
<div class="exam"><p><b>Exam trap.</b> 403 "aap kaun ho" hai (key ya password) aur code 16 "aapko ijazat nahi" hai. Read-only role wali valid key ko H&#84;TP 200 aur code 16 milta hai. Timeout dono nahi hai: kisi ne jawab hi nahi diya.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Numeric codes aur exception classes wahi hain jo asli API aur library use karte hain, lekin lab mein message ke shabd saral hain. Asli PAN-OS mein aur codes hain (jaise invalid command ke liye 17 aur missing parameter ke liye 3), aur commit lock apna error deta hai.</p></div>

<div class="scn"><h4>"Key kharab hai" jo asal mein firewall rule nikla</h4><p>Ek script har subah 9 baje timeout ke saath fail hone lagi. Do logon ne key dobara banayi, kuch nahi badla. Wajah raaste ke ek firewall ki security policy thi jo office hours mein management subnet block karti thi. Error ne kabhi "credential" nahi kaha.</p><p><b>Lesson:</b> timeout path ki samasya hai. Kuch karne se pehle layer padho.</p></div>

<div class="iv"><p class="q">"API call ne H&#84;TP 200 diya lekin change nahi hai. Kya karoge?"</p><p>Body padhunga, kyunki PAN-OS asli verdict <code>status</code> attribute aur code mein rakhta hai. Code ko jo jaanta hoon usse milata hoon: galat xpath ya reference ke liye 12, blocked delete ke liye 10, role ki samasya ke liye 16. Phir wahi ek cheez theek karta hoon; andhadhund retry nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen layers padho: H&#84;TP status, body ka code aur message, Python exception.</li>
<li>403 credential hai, code 16 role, code 12 galat naam ya value, code 10 blocked delete.</li>
<li>Code 13 aur khaali code 7 reply failure nahi hain.</li>
<li>Zyadatar failures H&#84;TP 200 dete hain; body hamesha parse karo.</li>
<li>Timeout ka matlab jawab nahi aaya; network aur management service dekho, key nahi.</li>
</ul></div>
`}};export{e as default};
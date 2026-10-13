var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the script that hit four walls`,hi:`Troubleshooting workflow: woh script jo chaar deewaron se takrayi`},body:{en:`
<p>This chapter walks <b>Lab 2</b>, step by step. The script <code>pushrules.py</code> is meant to create two addresses and one policy for change CHG-3106 on FGT1, and it fails four times in a row. It also carries two habits that should never be in a script: a key written into the file, and a debug line that prints it. You fix the failures one at a time, and you fix the habits.</p>

<h3>An analogy: the doctor's routine</h3>
<p>A good doctor does not prescribe after the first word. She asks what hurts, takes the temperature, checks one thing, treats, and checks again. The same routine works on any failing script: <b>read the last line, name the layer, change one thing, re-run, write it down.</b> Four walls, four passes of the same loop.</p>

<h3>The method</h3>
<div class="dia"><svg viewBox="0 0 640 218" role="img" aria-label="Four walls between pushrules.py and the policy"><rect x="8" y="70" width="90" height="60" rx="10" fill="#bae6fd"/><text x="53" y="104" text-anchor="middle" class="svg-ink" font-size="12">pushrules.py</text><rect x="140" y="30" width="30" height="140" rx="6" fill="#fecaca"/><text x="155" y="24" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="155" y="190" text-anchor="middle" class="svg-ink" font-size="11">port</text><text x="155" y="204" text-anchor="middle" class="svg-muted" font-size="11">refused</text><line x1="98" y1="100" x2="140" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="140,100 132,96 132,104" fill="#64748b"/><rect x="252" y="30" width="30" height="140" rx="6" fill="#fed7aa"/><text x="267" y="24" text-anchor="middle" class="svg-accent" font-size="14">2</text><text x="267" y="190" text-anchor="middle" class="svg-ink" font-size="11">key</text><text x="267" y="204" text-anchor="middle" class="svg-muted" font-size="11">401</text><line x1="170" y1="100" x2="252" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="252,100 244,96 244,104" fill="#64748b"/><rect x="364" y="30" width="30" height="140" rx="6" fill="#fde68a"/><text x="379" y="24" text-anchor="middle" class="svg-accent" font-size="14">3</text><text x="379" y="190" text-anchor="middle" class="svg-ink" font-size="11">caller</text><text x="379" y="204" text-anchor="middle" class="svg-muted" font-size="11">403</text><line x1="282" y1="100" x2="364" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="364,100 356,96 356,104" fill="#64748b"/><rect x="476" y="30" width="30" height="140" rx="6" fill="#ddd6fe"/><text x="491" y="24" text-anchor="middle" class="svg-accent" font-size="14">4</text><text x="491" y="190" text-anchor="middle" class="svg-ink" font-size="11">data</text><text x="491" y="204" text-anchor="middle" class="svg-muted" font-size="11">424</text><line x1="394" y1="100" x2="476" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="476,100 468,96 468,104" fill="#64748b"/><line x1="506" y1="100" x2="560" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="560,100 552,96 552,104" fill="#64748b"/><rect x="560" y="70" width="72" height="60" rx="10" fill="#bbf7d0"/><text x="596" y="97" text-anchor="middle" class="svg-ink" font-size="12">FGT1</text><text x="596" y="114" text-anchor="middle" class="svg-muted" font-size="11">policy</text></svg><p class="cap">Each wall hides the next one. You only see wall 2 after you fix wall 1.</p></div>
<ol>
<li><b>Read the last line</b> of the error. The first lines of a traceback are the path; the last line is the cause.</li>
<li><b>Name the layer</b> with the routine of chapter 7: network, TLS, status plus error number, content.</li>
<li><b>Change exactly one thing.</b> Two changes at once and you will not know which one worked.</li>
<li><b>Re-run</b> and read the new last line. A different error is progress: you passed a wall.</li>
<li><b>Write down</b> what you found (ticket note), and leave the script safer than you found it.</li>
</ol>

<h3>Wall 1: nothing answers on the port</h3>
<pre class="out">AUTO01$ python3 pushrules.py
Traceback (most recent call last):
  File "pushrules.py", line 36, in &lt;module&gt;
    if exists("firewall/address", name):
  File "pushrules.py", line 32, in exists
    return bool(call("GET", "/cmdb/" + path, params={"filter": "name==" + name})["results"])
  File "pushrules.py", line 21, in call
    r = requests.request(method, BASE + path, headers=HEADERS, verify=False, timeout=5, **kw)
<span class="hl">requests.exceptions.ConnectionError: HTTPSConnectionPool(host='10.99.0.41', port=443): Max retries exceeded with url: /api/v2/cmdb/firewall/address (Caused by NewConnectionError: [Errno 111] Connection refused)</span></pre>
<p>The last line says <code>Connection refused</code> on port 443. That is the network layer: the host is there (otherwise it would be a timeout), but nothing listens on that port. Ask the firewall which port it uses for administration. The block below holds the question, the one-line fix of the script's URL (with <code>sed</code>) and the retry, which already shows the next wall:</p>
<pre class="out">FGT1 # show system global
config system global
    set hostname "FGT1"
<span class="hl">    set admin-sport 8443</span>
end
AUTO01$ sed -i 's#10.99.0.41/api#10.99.0.41:8443/api#' pushrules.py
AUTO01$ python3 pushrules.py
<span class="hl">DEBUG request headers: {'Authorization': 'Bearer 25dqoYTKc2BnWgB5O3xoNGgbVdy87O'}</span>
<span class="hl">GET /cmdb/firewall/address -&gt; status 401, FortiOS error -37</span></pre>
<p><code>admin-sport 8443</code>: the administration port was moved. The script passed wall 1 (the answer is now a firewall answer, status 401), and wall 2 begins. But look at the second line of that output: <code>DEBUG request headers:</code> followed by the whole <code>Authorization</code> header. That is the key, printed to the terminal. It would be the same in a log file, a CI log, or a screenshot in a ticket. Remember it; we fix it below.</p>

<h3>Wall 2: the key is not accepted (and two bad habits)</h3>
<p>Status 401 and error -37 is the key. The script has a key written in the file ("pasted from the console on change day"). The key in the file no longer matches the firewall (it was replaced). The cure has two parts: a new key, and no key in the file.</p>
<pre class="out">FGT1 # execute api-user generate-key pyapi
<span class="hl">New API key: 8MZICJjouNLJ0jZUaYHalxE5dKwXP2</span>
NOTE: The bearer of this API key will be granted all access privileges assigned to the api-user pyapi.
AUTO01$ export FGT_TOKEN=8MZICJjouNLJ0jZUaYHalxE5dKwXP2
AUTO01$ sed -i 's/^TOKEN = .*/TOKEN = os.environ["FGT_TOKEN"]/' pushrules.py
AUTO01$ sed -i 's/^import sys$/import os\\nimport sys/' pushrules.py
AUTO01$ sed -i '/DEBUG request headers/d' pushrules.py
AUTO01$ grep -nE '[A-Za-z0-9]{30}' pushrules.py; echo "matches: $?"
<span class="hl">matches: 1</span>
AUTO01$ head -12 pushrules.py
"""pushrules.py - CHG-3106: let the app server reach the database tier on FortiGate FGT1"""
import os
import sys

import requests

BASE = "h&#116;tps://10.99.0.41:8443/api/v2"
<span class="hl">TOKEN = os.environ["FGT_TOKEN"]</span>
HEADERS = {"Authorization": "Bearer " + TOKEN}

ADDRESSES = [("app-srv", "10.20.0.10 255.255.255.255"), ("db-srv", "10.20.0.20 255.255.255.255")]
POLICY = {</pre>
<p>Read the sequence: (1) generate a new key on the firewall; (2) export it into the shell; (3) replace the hard-coded <code>TOKEN = ...</code> line with <code>os.environ["FGT_TOKEN"]</code>; (4) add the <code>import os</code> line; (5) delete the debug print; (6) audit with the 30-character search: <code>matches: 1</code> means no key is left in the file; (7) look at the top of the file to see the result. The environment variable is where a key belongs, and the audit makes the result visible instead of assumed.</p>
<pre class="out">AUTO01$ python3 pushrules.py
<span class="hl">GET /cmdb/firewall/address -&gt; status 403, FortiOS error -14</span></pre>
<p>The script moved on again: the key is accepted, and the new error is 403 with error -14.</p>

<h3>Wall 3: valid key, still refused (403)</h3>
<p>Remember chapter 7: 403 with -14 is a key that is valid but not allowed from <i>here</i>. The api-user has a list of trusted hosts. Look at it:</p>
<pre class="out">FGT1 # show system api-user
config system api-user
    edit "pyapi"
        set api-key ENC SH291ca014094ca05f993ca046696ca091fa8f3932ba9f394be
        set accprofile "prof_admin"
        set vdom "root"
        config trusthost
            edit 1
<span class="hl">                set ipv4-trusthost 10.50.0.0 255.255.255.0</span>
            next
        end
    next
end</pre>
<p>Only 10.50.0.0/24 is trusted. The automation host is 10.99.0.60. Add it as a second entry, as narrow as possible (a single host, 255.255.255.255), instead of opening the whole range:</p>
<pre class="code">config system api-user
    edit pyapi
        config trusthost
            edit 2
                set ipv4-trusthost 10.99.0.60 255.255.255.255
            next
        end
    next
end</pre>
<pre class="out">AUTO01$ python3 pushrules.py
address app-srv created
address db-srv created
<span class="hl">POST /cmdb/firewall/policy -&gt; status 424, FortiOS error -3 entry not found in datasource | value parse error before 'db-srv1'</span></pre>
<p>Progress again, and this time it is real: the two addresses were <b>created</b> before the policy failed. Wall 4 is the content of the policy. Read the last line: <code>entry not found in datasource | value parse error before 'db-srv1'</code>. The policy refers to an address called <code>db-srv1</code>. The address that was created is called <code>db-srv</code>. One character too many.</p>

<h3>Wall 4: a typo, and why idempotence pays</h3>
<pre class="out">AUTO01$ sed -i 's/db-srv1/db-srv/' pushrules.py
AUTO01$ python3 pushrules.py
address app-srv already there
address db-srv already there
<span class="hl">policy app-to-db created, policyid 1</span>
AUTO01$ python3 pushrules.py
<span class="hl">address app-srv already there</span>
<span class="hl">address db-srv already there</span>
<span class="hl">policy app-to-db already there</span></pre>
<p>One edit with <code>sed</code>, one run. Look at what the script printed: the two addresses are <i>already there</i> (they were created in the failed run), and the policy is <b>created, policyid 1</b>. A third run says <i>already there</i> for everything. A script that checks before it creates cannot create a duplicate, however many times a failing change has to be started over. Confirm on the firewall:</p>
<pre class="out">FGT1 # show firewall policy
config firewall policy
    edit 1
        set name "app-to-db"
        set uuid 212226df-f762-5181-874e-e9b862197b2e
        set srcintf "port2"
        set dstintf "port1"
        set action accept
<span class="hl">        set srcaddr "app-srv"</span>
<span class="hl">        set dstaddr "db-srv"</span>
        set schedule "always"
<span class="hl">        set service "MYSQL"</span>
        set comments "CHG-3106"
    next
end</pre>

<h3>One last test: the delete that is refused</h3>
<p>Now try to clean up with a bare <code>curl</code> and delete the address <code>db-srv</code>:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X DELETE h&#116;tps://10.99.0.41:8443/api/v2/cmdb/firewall/address/db-srv -w "\\n%{http_code}\\n"
{
  "http_method":"DELETE",
  "path":"firewall",
  "name":"address",
  "mkey":"db-srv",
<span class="hl">  "error":-23,</span>
<span class="hl">  "cli_error":"The entry is used by other 1 entries\\nCommand fail. Return code -23\\n",</span>
  "status":"error",
<span class="hl">  "http_status":500,</span>
  "vdom":"root",
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}
<span class="hl">500</span></pre>
<p>The firewall refuses (status 500, error -23): the policy still uses the address. The order of cleanup is the reverse of the order of creation: first the policy, then the address. The answer to the last question of the lab is simply the word <b>inuse</b>.</p>

<h3>Symptom table</h3>
<table>
<tr><th>You see</th><th>Layer</th><th>First check</th></tr>
<tr><td>ConnectionError, Connection refused</td><td>network</td><td>port number (<code>show system global</code>), service enabled</td></tr>
<tr><td>Timeout</td><td>network</td><td>route, access lists, trusted network of the service</td></tr>
<tr><td>SSLError (real gear)</td><td>TLS</td><td>CA bundle or pinned certificate</td></tr>
<tr><td>401, -37 (ASA: UNAUTHORIZED)</td><td>key / login</td><td>environment variable, key rotated, token expired</td></tr>
<tr><td>403, -14</td><td>permission</td><td>trusted hosts, access profile</td></tr>
<tr><td>404, -3 on a GET</td><td>content</td><td>path or name spelling</td></tr>
<tr><td>424 or 500, -3 on a POST</td><td>content</td><td>the name in <code>cli_error</code></td></tr>
<tr><td>-5 (ASA: DUPLICATE)</td><td>content</td><td>use ensure()</td></tr>
<tr><td>-23 (ASA: IN-USE)</td><td>dependency</td><td>who uses the object</td></tr>
</table>

<h3>If a key is ever leaked</h3>
<ol>
<li><b>Replace the key at once</b> with generate-key. The leaked one stops working immediately.</li>
<li><b>Check who used it</b> in the firewall's admin or event logs; look for source addresses that are not on the trusted hosts list.</li>
<li><b>Remove it from the places it spread to</b>: the file, the shell history, the CI log, the chat. Deleting a message does not undo that someone has seen it.</li>
<li><b>Fix the cause</b>: environment variable, no debug print of headers, the audit before every commit.</li>
<li><b>Record it</b> in the ticket and tell the owner of the key.</li>
</ol>

<div class="eg"><p><b>Worked example: the same loop on the ASA.</b> A script that worked yesterday now times out on the ASA token call. Read the last line: <code>Timeout</code>, so the network layer. Compare with a working host: the ASA <code>h&#116;tp</code> access line allows only the management subnet, and the script runs from a new server. One change (add the server's subnet), one re-run, done. The loop is the same; only the first-check column of the table changes.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab traceback has fewer frames than a real CPython traceback; the last line is the same. The error numbers in the table were written from memory and not checked against a real FortiGate; read the number your device returns. A real firewall also keeps its own audit trail of API calls, which the lab does not show.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three things between two runs. Fixing the key by pasting the new one into the file "just for now". Opening the trusted hosts list to 0.0.0.0/0 to make the 403 go away. Leaving the debug print in because "it helped". Retrying the same request after a 401 or 403.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order of the walls follows the layers: a 401 can only appear after the connection works, a 403 after the key is accepted, a 424 after the host is allowed. If you get a new error after a fix, you are making progress, not breaking things.</p></div>

<div class="scn"><h4>The ticket that said "API is down"</h4><p>A colleague wrote "FortiGate API down" in the chat. The first error was <code>Connection refused</code>. The API was not down; the administration port had been changed in a hardening ticket the week before and nobody had updated the script. Fixed in one line. The second error, 401, was a different problem (a rotated key), and the third, 403, was a third (a trusted network that did not include the new automation host). Three small causes behind one scary message.</p><p><b>Lesson:</b> read each error on its own, do not assume one cause for the whole chain.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a failing firewall API script."</p><p>I read the last line and name the layer: network, TLS, status plus device error number, content. I change one thing, re-run, and read the new error, because a different error means a wall passed. I check the trusted hosts for a 403, the key and the environment for a 401, the name in cli_error for a content error. I make sure the fix does not leave a key in the file or the logs, and I write it down.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop: read the last line, name the layer, change one thing, re-run, record.</li>
<li>Lab 2 walls: Connection refused (port), 401 (key), 403 (trusted host), 424 -3 (typo), then -23 on delete.</li>
<li>Fix key problems by environment variable, never by pasting a key into the file; audit with grep.</li>
<li>Never print request headers; if a key leaks, rotate first.</li>
<li>Idempotent scripts survive a half-finished run; delete in reverse order of creation.</li>
</ul></div>
`,hi:`
<p>Yeh chapter <b>Lab 2</b> ko step by step chalata hai. Script <code>pushrules.py</code> ko FGT1 par change CHG-3106 ke liye do addresses aur ek policy banani hai, aur woh lagatar chaar baar fail hoti hai. Usme do aadatein bhi hain jo script mein kabhi nahi honi chahiye: file mein likhi key, aur ek debug line jo use print karti hai. Aap failures ek ek karke theek karte ho, aur aadatein bhi.</p>

<h3>Ek analogy: doctor ka routine</h3>
<p>Achha doctor pehle shabd par dawa nahi likhta. Woh poochhti hai kya dukhta hai, temperature leti hai, ek cheez check karti hai, ilaaj karti hai, aur phir check karti hai. Yahi routine har fail hoti script par chalta hai: <b>aakhri line padho, layer ka naam lo, ek cheez badlo, dobara chalao, likh lo.</b> Chaar deewarein, wahi loop chaar baar.</p>

<h3>Method</h3>
<div class="dia"><svg viewBox="0 0 640 218" role="img" aria-label="pushrules.py aur policy ke beech chaar deewarein"><rect x="8" y="70" width="90" height="60" rx="10" fill="#bae6fd"/><text x="53" y="104" text-anchor="middle" class="svg-ink" font-size="12">pushrules.py</text><rect x="140" y="30" width="30" height="140" rx="6" fill="#fecaca"/><text x="155" y="24" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="155" y="190" text-anchor="middle" class="svg-ink" font-size="11">port</text><text x="155" y="204" text-anchor="middle" class="svg-muted" font-size="11">refused</text><line x1="98" y1="100" x2="140" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="140,100 132,96 132,104" fill="#64748b"/><rect x="252" y="30" width="30" height="140" rx="6" fill="#fed7aa"/><text x="267" y="24" text-anchor="middle" class="svg-accent" font-size="14">2</text><text x="267" y="190" text-anchor="middle" class="svg-ink" font-size="11">key</text><text x="267" y="204" text-anchor="middle" class="svg-muted" font-size="11">401</text><line x1="170" y1="100" x2="252" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="252,100 244,96 244,104" fill="#64748b"/><rect x="364" y="30" width="30" height="140" rx="6" fill="#fde68a"/><text x="379" y="24" text-anchor="middle" class="svg-accent" font-size="14">3</text><text x="379" y="190" text-anchor="middle" class="svg-ink" font-size="11">caller</text><text x="379" y="204" text-anchor="middle" class="svg-muted" font-size="11">403</text><line x1="282" y1="100" x2="364" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="364,100 356,96 356,104" fill="#64748b"/><rect x="476" y="30" width="30" height="140" rx="6" fill="#ddd6fe"/><text x="491" y="24" text-anchor="middle" class="svg-accent" font-size="14">4</text><text x="491" y="190" text-anchor="middle" class="svg-ink" font-size="11">data</text><text x="491" y="204" text-anchor="middle" class="svg-muted" font-size="11">424</text><line x1="394" y1="100" x2="476" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="476,100 468,96 468,104" fill="#64748b"/><line x1="506" y1="100" x2="560" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="560,100 552,96 552,104" fill="#64748b"/><rect x="560" y="70" width="72" height="60" rx="10" fill="#bbf7d0"/><text x="596" y="97" text-anchor="middle" class="svg-ink" font-size="12">FGT1</text><text x="596" y="114" text-anchor="middle" class="svg-muted" font-size="11">policy</text></svg><p class="cap">Har deewar agli ko chhupati hai. Deewar 2 tabhi dikhti hai jab deewar 1 theek ho.</p></div>
<ol>
<li>Error ki <b>aakhri line padho</b>. Traceback ki pehli lines raasta hain; aakhri line wajah hai.</li>
<li>Chapter 7 ke routine se <b>layer ka naam lo</b>: network, TLS, status plus error number, content.</li>
<li><b>Bilkul ek cheez badlo.</b> Ek saath do badlav kiye to pata nahi chalega kaunsa kaam aaya.</li>
<li><b>Dobara chalao</b> aur nayi aakhri line padho. Alag error matlab progress: aap ek deewar paar kar gaye.</li>
<li><b>Likh lo</b> ki kya mila (ticket note), aur script ko jaisa mili usse zyada safe chhodo.</li>
</ol>

<h3>Deewar 1: port par kuch jawab nahi deta</h3>
<pre class="out">AUTO01$ python3 pushrules.py
Traceback (most recent call last):
  File "pushrules.py", line 36, in &lt;module&gt;
    if exists("firewall/address", name):
  File "pushrules.py", line 32, in exists
    return bool(call("GET", "/cmdb/" + path, params={"filter": "name==" + name})["results"])
  File "pushrules.py", line 21, in call
    r = requests.request(method, BASE + path, headers=HEADERS, verify=False, timeout=5, **kw)
<span class="hl">requests.exceptions.ConnectionError: HTTPSConnectionPool(host='10.99.0.41', port=443): Max retries exceeded with url: /api/v2/cmdb/firewall/address (Caused by NewConnectionError: [Errno 111] Connection refused)</span></pre>
<p>Aakhri line kehti hai port 443 par <code>Connection refused</code>. Yeh network layer hai: host maujood hai (warna timeout hota), par us port par koi sunta nahi. Firewall se poocho administration ke liye kaunsa port use karta hai. Neeche ke block mein sawal hai, script ke URL ka ek line ka fix (<code>sed</code> se) aur retry, jo agli deewar pehle hi dikha deta hai:</p>
<pre class="out">FGT1 # show system global
config system global
    set hostname "FGT1"
<span class="hl">    set admin-sport 8443</span>
end
AUTO01$ sed -i 's#10.99.0.41/api#10.99.0.41:8443/api#' pushrules.py
AUTO01$ python3 pushrules.py
<span class="hl">DEBUG request headers: {'Authorization': 'Bearer 25dqoYTKc2BnWgB5O3xoNGgbVdy87O'}</span>
<span class="hl">GET /cmdb/firewall/address -&gt; status 401, FortiOS error -37</span></pre>
<p><code>admin-sport 8443</code>: administration port badal diya gaya tha. Script ne deewar 1 paar kar li (ab jawab firewall ka hai, status 401), aur deewar 2 shuru. Par us output ki doosri line dekho: <code>DEBUG request headers:</code> ke baad poora <code>Authorization</code> header. Yeh key hai, terminal par print hui. Log file, CI log ya ticket ke screenshot mein bhi yahi hota. Yaad rakho; neeche iska ilaaj hai.</p>

<h3>Deewar 2: key accept nahi (aur do buri aadatein)</h3>
<p>Status 401 aur error -37 key hai. Script ki file mein key likhi hai ("change day par console se paste ki"). File ki key ab firewall se match nahi karti (badal di gayi). Ilaaj ke do hisse: nayi key, aur file mein key nahi.</p>
<pre class="out">FGT1 # execute api-user generate-key pyapi
<span class="hl">New API key: 8MZICJjouNLJ0jZUaYHalxE5dKwXP2</span>
NOTE: The bearer of this API key will be granted all access privileges assigned to the api-user pyapi.
AUTO01$ export FGT_TOKEN=8MZICJjouNLJ0jZUaYHalxE5dKwXP2
AUTO01$ sed -i 's/^TOKEN = .*/TOKEN = os.environ["FGT_TOKEN"]/' pushrules.py
AUTO01$ sed -i 's/^import sys$/import os\\nimport sys/' pushrules.py
AUTO01$ sed -i '/DEBUG request headers/d' pushrules.py
AUTO01$ grep -nE '[A-Za-z0-9]{30}' pushrules.py; echo "matches: $?"
<span class="hl">matches: 1</span>
AUTO01$ head -12 pushrules.py
"""pushrules.py - CHG-3106: let the app server reach the database tier on FortiGate FGT1"""
import os
import sys

import requests

BASE = "h&#116;tps://10.99.0.41:8443/api/v2"
<span class="hl">TOKEN = os.environ["FGT_TOKEN"]</span>
HEADERS = {"Authorization": "Bearer " + TOKEN}

ADDRESSES = [("app-srv", "10.20.0.10 255.255.255.255"), ("db-srv", "10.20.0.20 255.255.255.255")]
POLICY = {</pre>
<p>Sequence padho: (1) firewall par nayi key generate karo; (2) shell mein export karo; (3) hard-coded <code>TOKEN = ...</code> line ko <code>os.environ["FGT_TOKEN"]</code> se badlo; (4) <code>import os</code> line jodo; (5) debug print delete karo; (6) 30-character search se audit karo: <code>matches: 1</code> ka matlab file mein key nahi bachi; (7) result dekhne ke liye file ka upar ka hissa dekho. Key ki jagah environment variable hai, aur audit result ko maan lene ki jagah dikhata hai.</p>
<pre class="out">AUTO01$ python3 pushrules.py
<span class="hl">GET /cmdb/firewall/address -&gt; status 403, FortiOS error -14</span></pre>
<p>Script phir aage badhi: key accept hui, aur naya error 403 hai error -14 ke saath.</p>

<h3>Deewar 3: key valid, phir bhi refuse (403)</h3>
<p>Chapter 7 yaad karo: 403 aur -14 ka matlab key valid hai par <i>yahan</i> se allowed nahi. Api-user ki trusted hosts ki list hai. Dekho:</p>
<pre class="out">FGT1 # show system api-user
config system api-user
    edit "pyapi"
        set api-key ENC SH291ca014094ca05f993ca046696ca091fa8f3932ba9f394be
        set accprofile "prof_admin"
        set vdom "root"
        config trusthost
            edit 1
<span class="hl">                set ipv4-trusthost 10.50.0.0 255.255.255.0</span>
            next
        end
    next
end</pre>
<p>Sirf 10.50.0.0/24 trusted hai. Automation host 10.99.0.60 hai. Poori range kholne ki jagah, jitna ho sake utna narrow, doosri entry ki tarah jodo (ek host, 255.255.255.255):</p>
<pre class="code">config system api-user
    edit pyapi
        config trusthost
            edit 2
                set ipv4-trusthost 10.99.0.60 255.255.255.255
            next
        end
    next
end</pre>
<pre class="out">AUTO01$ python3 pushrules.py
address app-srv created
address db-srv created
<span class="hl">POST /cmdb/firewall/policy -&gt; status 424, FortiOS error -3 entry not found in datasource | value parse error before 'db-srv1'</span></pre>
<p>Phir progress, aur is baar asli: policy fail hone se pehle do addresses <b>create ho gaye</b>. Deewar 4 policy ka content hai. Aakhri line padho: <code>entry not found in datasource | value parse error before 'db-srv1'</code>. Policy <code>db-srv1</code> naam ke address ko refer karti hai. Jo address bana uska naam <code>db-srv</code> hai. Ek character zyada.</p>

<h3>Deewar 4: typo, aur idempotence ka fayda</h3>
<pre class="out">AUTO01$ sed -i 's/db-srv1/db-srv/' pushrules.py
AUTO01$ python3 pushrules.py
address app-srv already there
address db-srv already there
<span class="hl">policy app-to-db created, policyid 1</span>
AUTO01$ python3 pushrules.py
<span class="hl">address app-srv already there</span>
<span class="hl">address db-srv already there</span>
<span class="hl">policy app-to-db already there</span></pre>
<p><code>sed</code> se ek edit, ek run. Dekho script ne kya print kiya: do addresses <i>already there</i> hain (failed run mein bane the), aur policy <b>created, policyid 1</b>. Teesri run har cheez ke liye <i>already there</i> kehti hai. Jo script banane se pehle check karti hai woh duplicate nahi bana sakti, chahe fail hua change kitni bhi baar shuru karna pade. Firewall par confirm karo:</p>
<pre class="out">FGT1 # show firewall policy
config firewall policy
    edit 1
        set name "app-to-db"
        set uuid 212226df-f762-5181-874e-e9b862197b2e
        set srcintf "port2"
        set dstintf "port1"
        set action accept
<span class="hl">        set srcaddr "app-srv"</span>
<span class="hl">        set dstaddr "db-srv"</span>
        set schedule "always"
<span class="hl">        set service "MYSQL"</span>
        set comments "CHG-3106"
    next
end</pre>

<h3>Ek aakhri test: delete jo refuse hota hai</h3>
<p>Ab nangi <code>curl</code> se safai karo aur address <code>db-srv</code> delete karne ki koshish karo:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X DELETE h&#116;tps://10.99.0.41:8443/api/v2/cmdb/firewall/address/db-srv -w "\\n%{http_code}\\n"
{
  "http_method":"DELETE",
  "path":"firewall",
  "name":"address",
  "mkey":"db-srv",
<span class="hl">  "error":-23,</span>
<span class="hl">  "cli_error":"The entry is used by other 1 entries\\nCommand fail. Return code -23\\n",</span>
  "status":"error",
<span class="hl">  "http_status":500,</span>
  "vdom":"root",
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}
<span class="hl">500</span></pre>
<p>Firewall refuse karta hai (status 500, error -23): policy abhi bhi address use karti hai. Safai ka order banane ke order ka ulta hai: pehle policy, phir address. Lab ke aakhri sawal ka jawab sirf shabd <b>inuse</b> hai.</p>

<h3>Lakshan table</h3>
<table>
<tr><th>Aap dekhte ho</th><th>Layer</th><th>Pehla check</th></tr>
<tr><td>ConnectionError, Connection refused</td><td>network</td><td>port number (<code>show system global</code>), service enabled</td></tr>
<tr><td>Timeout</td><td>network</td><td>route, access lists, service ka trusted network</td></tr>
<tr><td>SSLError (asli gear)</td><td>TLS</td><td>CA bundle ya pinned certificate</td></tr>
<tr><td>401, -37 (ASA: UNAUTHORIZED)</td><td>key / login</td><td>environment variable, key rotate hui, token expire</td></tr>
<tr><td>403, -14</td><td>permission</td><td>trusted hosts, access profile</td></tr>
<tr><td>GET par 404, -3</td><td>content</td><td>path ya naam ki spelling</td></tr>
<tr><td>POST par 424 ya 500, -3</td><td>content</td><td><code>cli_error</code> mein naam</td></tr>
<tr><td>-5 (ASA: DUPLICATE)</td><td>content</td><td>ensure() use karo</td></tr>
<tr><td>-23 (ASA: IN-USE)</td><td>dependency</td><td>object kaun use karta hai</td></tr>
</table>

<h3>Agar key kabhi leak ho</h3>
<ol>
<li>generate-key se <b>turant key badlo</b>. Leaked wali foran band ho jaati hai.</li>
<li><b>Dekho kisne use ki</b> firewall ke admin ya event logs mein; aise source addresses dhoondho jo trusted hosts list par nahi hain.</li>
<li>Jahan-jahan fail gayi wahan se <b>hatao</b>: file, shell history, CI log, chat. Message delete karne se yeh nahi mitta ki kisi ne dekh liya.</li>
<li><b>Wajah theek karo</b>: environment variable, headers ka debug print nahi, har commit se pehle audit.</li>
<li>Ticket mein <b>record karo</b> aur key ke owner ko batao.</li>
</ol>

<div class="eg"><p><b>Worked example: ASA par wahi loop.</b> Kal chalti script ab ASA token call par timeout deti hai. Aakhri line padho: <code>Timeout</code>, yaani network layer. Chalte hue host se compare karo: ASA ki <code>h&#116;tp</code> access line sirf management subnet allow karti hai, aur script naye server se chalti hai. Ek badlav (server ka subnet jodo), ek re-run, kaam khatam. Loop wahi hai; sirf table ka pehla-check column badalta hai.</p></div>

<div class="note"><p><b>Lab vs asli gear.</b> Lab traceback mein asli CPython traceback se kam frames hain; aakhri line wahi hai. Table ke error numbers yaad se likhe hain aur asli FortiGate se check nahi kiye; apna device jo number lautata hai wahi padho. Asli firewall API calls ka apna audit trail bhi rakhta hai, jo lab nahi dikhata.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Do runs ke beech teen cheezein badalna. Key ko "abhi ke liye" file mein paste karke theek karna. 403 hatane ke liye trusted hosts list ko 0.0.0.0/0 tak kholna. Debug print ko "madad karta tha" bol kar chhod dena. 401 ya 403 ke baad wahi request retry karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Deewaron ka order layers ko follow karta hai: 401 tabhi aa sakta hai jab connection chale, 403 tab jab key accept ho, 424 tab jab host allowed ho. Fix ke baad naya error aaye to aap progress kar rahe ho, cheezein bigaad nahi rahe.</p></div>

<div class="scn"><h4>Woh ticket jisme likha tha "API down hai"</h4><p>Ek colleague ne chat mein likha "FortiGate API down". Pehla error <code>Connection refused</code> tha. API down nahi thi; hardening ticket mein pichhle hafte administration port badla gaya tha aur kisi ne script update nahi ki. Ek line mein fix. Doosra error, 401, alag problem thi (rotate hui key), aur teesra, 403, teesri (trusted network mein naya automation host nahi tha). Ek darawne message ke peeche teen chhoti wajahein.</p><p><b>Lesson:</b> har error ko alag padho, poori chain ke liye ek wajah mat maano.</p></div>

<div class="iv"><p class="q">"Fail hoti firewall API script ko kaise troubleshoot karte ho, samjhao."</p><p>Main aakhri line padhta hoon aur layer ka naam leta hoon: network, TLS, status plus device error number, content. Ek cheez badalta hoon, dobara chalata hoon, aur naya error padhta hoon, kyunki alag error matlab deewar paar hui. 403 ke liye trusted hosts, 401 ke liye key aur environment, content error ke liye cli_error ka naam dekhta hoon. Dhyan rakhta hoon ki fix file ya logs mein key na chhode, aur likh leta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Loop: aakhri line padho, layer ka naam lo, ek cheez badlo, dobara chalao, record karo.</li>
<li>Lab 2 ki deewarein: Connection refused (port), 401 (key), 403 (trusted host), 424 -3 (typo), phir delete par -23.</li>
<li>Key problems environment variable se theek karo, file mein key paste karke nahi; grep se audit karo.</li>
<li>Request headers kabhi print mat karo; key leak ho to pehle rotate karo.</li>
<li>Idempotent scripts adhoori run se bach jaati hain; delete banane ke ulte order mein karo.</li>
</ul></div>
`}};export{e as default};
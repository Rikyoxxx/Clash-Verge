function setGlobalConfig(config) {
  /**
   * 进程匹配模式
   * 控制是否让 Clash 去匹配进程
   * - always 开启，强制匹配所有进程
   * - strict 默认，由 Clash 判断是否开启
   * - off 不匹配进程，推荐在路由器上使用此模式
   */
  config['find-process-mode'] = 'strict';
  /**
   * 缓存
   */
  config['profile'] = {
    // 储存 API 对策略组的选择，以供下次启动时使用
    'store-selected': true,
    // 储存 fakeip 映射表，域名再次发生连接时，使用原有映射地址
    'store-fake-ip': true,
  };
  /**
   * 统一延迟
   * 开启统一延迟时，会计算 RTT，以消除连接握手等带来的不同类型节点的延迟差异
   * 可选值 true/false
   */
  config['unified-delay'] = true;
  /**
   * TCP 并发
   * 启用 TCP 并发连接，将会使用 dns 解析出的所有 IP 地址进行连接，使用第一个成功的连接
   * 可选值 true/false
   */
  config['tcp-concurrent'] = true;

  /**
   * 全局客户端指纹
   * 全局 TLS 指纹，优先低于 proxy 内的 client-fingerprint。
   * 目前支持开启 TLS 传输的 TCP/grpc/WS/HTTP , 支持协议有 VLESS,Vmess 和 trojan.
   * 可选：chrome, firefox, safari, ios, android, edge, 360, qq, random, 若选择 random, 则按 Cloudflare Radar 数据按概率生成一个现代浏览器指纹。
   */
  config['global-client-fingerprint'] = 'chrome';
  /**
   * GEOIP 数据模式
   * 更改 geoip 使用文件，mmdb 或者 dat，可选 true/false,true为 dat
   * @default false
   */
  config['geodata-mode'] = true;
  /**
   * GEO 文件加载模式
   * 可选的加载模式如下
   * - standard：标准加载器
   * - memconservative：专为内存受限 (小内存) 设备优化的加载器
   * @default 'memconservative'
   */
  config['geodata-loader'] = 'standard';
  /**
   * 自动更新 GEO
   */
  config['geo-auto-update'] = true;
  /**
   * GEO 更新间隔
   * 单位为小时
   */
  config['geo-update-interval'] = 168;
  /**
   * 自定 GEO 下载地址
   */
  config['geox-url'] = {
    geoip: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
    geosite: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
    mmdb: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
    asn: "https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb",
  };
  /**
   * 自定全局 UA
   * 自定义外部资源下载时使用的的 UA，默认为 clash.meta
   */
  config['global-ua'] = 'chrome';
}

function setDnsConfig(config) {
  // 国内DNS服务器
  const domesticNameservers = [
    'https://223.5.5.5/dns-query', // 阿里云DoH
    'https://119.29.29.29/dns-query', // 腾讯DoH
  ];
  // 国外DNS服务器
  const foreignNameservers = [
    'https://208.67.222.222/dns-query', // OpenDNS
    'https://77.88.8.8/dns-query', // YandexDNS
    'https://1.1.1.1/dns-query', // CloudflareDNS
    'https://8.8.4.4/dns-query', // GoogleDNS
  ];
  /**
 * DNS配置
 */
  config['dns'] = {
    /**
     * 是否启用，如为 false，则使用系统 DNS 解析
     */
    enable: true,
    /**
     * 支持的算法：
     * - lru: Least Recently Used
     * - arc: Adaptive Replacement Cache
     * @default 'lru'
     */
    'cache-algorithm': 'arc',
    /**
     * DOH 优先使用 http/3
     */
    'prefer-h3': false,
    /**
     * DNS 服务监听，支持 udp, tcp
     */
    listen: '0.0.0.0:1053',
    /**
     * 是否解析 IPV6, 如为 false, 则回应 AAAA 的空解析
     */
    ipv6: true,
    /**
     * 可选值 fake-ip/redir-host，默认redir-host
     */
    'enhanced-mode': 'fake-ip',
    /**
     * fakeip 下的 IP 段设置，tun 的默认 IPV4 地址 也使用此值作为参考
     */
    'fake-ip-range': '198.18.0.1/16',
    /**
     * fakeip 过滤，以下地址不会下发 fakeip 映射用于连接
     */

    'fake-ip-filter': [
      // 墙外服务
      'geosite:gfw',
      'geosite:google@!cn',
      'geosite:facebook',
      'geosite:telegram',
      'geosite:twitter',
      'geosite:youtube',
      // AI 服务
      'geosite:category-ai-!cn',
      'geosite:category-ai-chat-!cn',
      // 游戏相关
      'geosite:category-games-!cn',
      'geosite:steam@!cn',
      // 金融/银行相关
      'geosite:category-bank-cn@!cn',
      'geosite:category-bank-jp',
    ],
    /**
     * 可选 blacklist/whitelist，默认blacklist，whitelist 即只有匹配成功才返回 fake-ip
     */
    'fake-ip-filter-mode': 'whitelist',
    /**
     * 是否回应配置中的 hosts，默认 true
     */
    'use-hosts': true,
    /**
     * 是否查询系统 hosts，默认 true
     */
    'use-system-hosts': true,
    /**
     * dns 连接遵守路由规则，需配置 proxy-server-nameserver
     * 强烈不建议和 prefer-h3 一起使用
     */
    'respect-rules': true,
    /**
     * 指定域名查询的解析服务器，可使用 geosite, 优先于 nameserver/fallback 查询
     * 键支持域名通配
     * 值支持字符串/数组
     */
    'nameserver-policy': {
      'geosite:private': 'system',
      'geosite:tld-cn,cn,steam@cn,category-games@cn,microsoft@cn,apple@cn': domesticNameservers,
    },
    /**
     * 代理节点域名解析服务器，仅用于解析代理节点的域名，如果不填则遵循 nameserver-policy、nameserver 和 fallback 的配置
     */
    'proxy-server-nameserver': foreignNameservers,
    /**
     * 用于 direct 出口域名解析的 DNS 服务器，如果不填则遵循 nameserver-policy、nameserver 和 fallback 的配置
     */
    'direct-nameserver': domesticNameservers,
    /**
     * 默认的域名解析服务器
     */
    nameserver: foreignNameservers,
  };
}

function setSnifferConfig(config) {
  /**
 * 域名嗅探
 */
  config['sniffer'] = {
    /**
     * 是否启用 sniffer
     */
    enable: true,
    /**
     * 对 redir-host 类型识别的流量进行强制嗅探
     */
    'force-dns-mapping': true,
    /**
     * 对所有未获取到域名的流量进行强制嗅探
     */
    'parse-pure-ip': false,
    /**
     * 是否使用嗅探结果作为实际访问，默认为 true
     */
    'override-destination': true,
    /**
     * 需要嗅探的协议设置，仅支持 HTTP/TLS/QUIC
     * ports: 端口范围
     * override-destination: 覆盖全局override-destination设置
     */
    sniff: {
      HTTP: {
        ports: [80, '8080-8880'],
      },
      TLS: {
        ports: [443, 8443],
      },
      QUIC: {
        ports: [443, 8443],
      },
    },
    /**
     * 强制进行嗅探的域名列表，使用域名通配
     */
    'force-domain': [
      '+.google.com',
      '+.googleapis.com',
      '+.googleusercontent.com',
      '+.youtube.com',
      '+.facebook.com',
      '+.messenger.com',
      '+.fbcdn.net',
      'fbcdn-a.akamaihd.net'
    ],
    /**
     * 跳过嗅探的域名列表，使用域名通配
     */
    'skip-domain': [
      '+.lan',
      '+.local',
      '+.home.arpa'
    ],
  };
}

function buildRegionalProxyGroups(proxies, groupOption) {
  const strategies = [
    {
      name: '自动选择',
      type: 'url-test',
      defaultOption: {
        /**
         * 节点切换容差，单位 ms
         */
        tolerance: 50,
        /**
         * 在 api 返回hidden状态，以隐藏该策略组展示 (需要使用 api 的前端适配)
         */
        hidden: true,
        icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png'
      }
    },
    {
      name: '负载均衡',
      type: 'load-balance',
      defaultOption: {
        /**
         * 负载均衡策略
         * - round-robin 将会把所有的请求分配给策略组内不同的代理节点
         * - consistent-hashing 将相同的 目标地址 的请求分配给策略组内的同一个代理节点
         * - sticky-sessions: 将相同的 来源地址 和 目标地址 的请求分配给策略组内的同一个代理节点，缓存 10 分钟过期
         */
        strategy: 'consistent-hashing',
        hidden: true,
        icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Round_Robin.png'
      }
    },
    {
      name: '自动回退',
      type: 'fallback',
      defaultOption: {
        hidden: true,
        icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png'
      }
    },
  ];
  const regions = [
    {
      name: '🇭🇰 香港',
      filter: /^(?=.*(🇭🇰|香港|\b(HK|HKG|Hong)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png',
    },
    {
      name: '🇨🇳 台湾',
      filter: /^(?=.*(🇹🇼|台湾|\b(TW|TWN|Tai|Taiwan)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/China.png',
    },
    {
      name: '🇯🇵 日本',
      filter: /^(?=.*(🇯🇵|日本|川日|东京|大阪|泉日|埼玉|\b(JP|JPN|Japan)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png',
    },
    {
      name: '🇰🇷 韩国',
      filter: /^(?=.*(🇰🇷|韩国|韓|首尔|\b(KR|KOR|Korea)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png',
    },
    {
      name: '🇸🇬 新加坡',
      filter: /^(?=.*(🇸🇬|新加坡|狮|\b(SG|SGP|Singapore)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png',
    },
    {
      name: '🇺🇸 美国',
      filter: /^(?=.*(🇺🇸|美国|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|\b(US|USA|United States)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png',
    },
    {
      name: '🇬🇧 英国',
      filter: /^(?=.*(🇬🇧|英国|伦敦|\b(UK|GBR|United Kingdom)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_Kingdom.png',
    },
    {
      name: '🇫🇷 法国',
      filter: /^(?=.*(🇫🇷|法国|\b(FR|FRA|France)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/France.png',
    },
    {
      name: '🇩🇪 德国',
      filter: /^(?=.*(🇩🇪|德国|\b(DE|DEU|Germany)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Germany.png',
    },
    {
      name: '🇹🇷 土耳其',
      filter: /^(?=.*(🇹🇷|土耳其|\b(TR|TUR|Turkey)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Turkey.png',
    },
    {
      name: '🇮🇹 意大利',
      filter: /^(?=.*(🇮🇹|意大利|\b(IT|ITA|Italy)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/it.svg',
    },
    {
      name: '🇪🇸 西班牙',
      filter: /^(?=.*(🇪🇸|西班牙|\b(ES|ESP|Spain)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/es.svg',
    },
    {
      name: '🇵🇹 葡萄牙',
      filter: /^(?=.*(🇵🇹|葡萄牙|\b(PT|PRT|Portugal)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Portugal.png',
    },
    {
      name: '🇷🇺 俄罗斯',
      filter: /^(?=.*(🇷🇺|俄罗斯|俄国|\b(RU|RUS|Russia)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Russia.png',
    },
    {
      name: '🇦🇺 澳大利亚',
      filter: /^(?=.*(🇦🇺|澳大利亚|澳洲|\b(AU|AUS|Australia)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Australia.png',
    },
    {
      name: '🇨🇦 加拿大',
      filter: /^(?=.*(🇨🇦|加拿大|\b(CA|CAN|Canada)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Canada.png',
    },
    {
      name: '🇮🇳 印度',
      filter: /^(?=.*(🇮🇳|印度|\b(IN|IND|India)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/India.png',
    },
    {
      name: '🇮🇩 印度尼西亚',
      filter: /^(?=.*(🇮🇩|印尼|印度尼西亚|\b(ID|IDN|Indonesia)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/id.svg',
    },
    {
      name: '🇲🇾 马来西亚',
      filter: /^(?=.*(🇲🇾|马来西亚|大马|\b(MY|MYS|Malaysia)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Malaysia.png',
    },
    {
      name: '🇵🇭 菲律宾',
      filter: /^(?=.*(🇵🇭|菲律宾|\b(PH|PHL|Philippines)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Philippines.png',
    },
    {
      name: '🇻🇳 越南',
      filter: /^(?=.*(🇻🇳|越南|\b(VN|VNM|Vietnam)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/vn.svg',
    },
    {
      name: '🇹🇭 泰国',
      filter: /^(?=.*(🇹🇭|泰国|\b(TH|THA|Thailand)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Thailand.png',
    },
    {
      name: '🇦🇷 阿根廷',
      filter: /^(?=.*(🇦🇷|阿根廷|\b(AR|ARG|Argentina)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Argentina.png',
    },
    {
      name: '🇳🇱 荷兰',
      filter: /^(?=.*(🇳🇱|荷兰|\b(NL|NLD|Netherlands)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/nl.svg',
    },
    {
      name: '🇧🇷 巴西',
      filter: /^(?=.*(🇧🇷|巴西|\b(BR|BRA|Brazil)(\d*)\b)).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Brazil.png',
    },
    {
      name: '🌐 其他',
      filter: /^(?=.*(.))(?!.*(群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|超时|收藏|福利|邀请|好友|失联|(\b(USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author|Traffic)(\d+)?\b|(\d{4}-\d{2}-\d{2}|\dG)))).*$/i,
      proxies: [],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png',
    }
  ];

  for (const proxy of proxies) {
    const name = proxy.name
    for (const region of regions) {
      if (region.filter.test(name)) {
        region.proxies.push(name);
        break;
      }
    }
  }

  const regionalProxyGroups = [];
  const functionalProxyGroups = [];
  const regionalProxyNames = [];

  regions.forEach(region => {
    if (!region.proxies.length) return;

    const functionalProxyNames = [];
    if (region.name !== '🌐 其他' && region.proxies.length > 1) {
      strategies.forEach(strategy => {
        const functionalProxyName = `${region.name}[${strategy.name}]`;
        functionalProxyNames.push(functionalProxyName);
        functionalProxyGroups.push({
          ...groupOption,
          name: functionalProxyName,
          type: strategy.type,
          proxies: region.proxies,
          ...strategy.defaultOption,
        });
      });
    }

    regionalProxyNames.push(region.name);
    regionalProxyGroups.push({
      ...groupOption,
      name: region.name,
      type: 'select',
      proxies: [...functionalProxyNames, ...region.proxies],
      icon: region.icon,
    });
  })

  return {
    proxyGroups: [...regionalProxyGroups, ...functionalProxyGroups],
    regionalProxyNames,
  };
}

function setProxyGroups(config) {
  // 代理组通用配置
  const groupBaseOption = {
    /**
     * 健康检查测试地址
     */
    url: 'http://www.google.com/generate_204',
    /**
     * 健康检查间隔，如不为 0 则启用定时测试，单位为秒
     */
    interval: 300,
    /**
     * 懒惰状态，默认为true,未选择到当前策略组时，不进行测试
     */
    lazy: true,
    /**
     * 健康检查超时时间，单位为毫秒
     */
    timeout: 3000,
    /**
     * 禁用该策略组的UDP
     */
    'disable-udp': false,
    /**
     * 在 api 返回hidden状态，以隐藏该策略组展示 (需要使用 api 的前端适配)
     */
    hidden: false,
  };
  const {
    proxyGroups: reginalProxyGroups,
    regionalProxyNames
  } = buildRegionalProxyGroups(config.proxies, groupBaseOption)
  /**
   * 代理组
   */
  config['proxy-groups'] = [
    {
      ...groupBaseOption,
      name: '默认节点',
      type: 'select',
      proxies: [...regionalProxyNames, 'DIRECT'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Available.png',
    },
    {
      ...groupBaseOption,
      name: 'Github',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames, 'DIRECT'],
      url: 'https://github.com/robots.txt',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/GitHub.png',
    },
    {
      ...groupBaseOption,
      name: '谷歌服务',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png',
    },
    {
      ...groupBaseOption,
      name: '苹果服务',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'http://www.apple.com/library/test/success.html',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple_2.png',
    },
    {
      ...groupBaseOption,
      name: '微软服务',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'http://www.msftconnecttest.com/connecttest.txt',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png',
    },
    {
      ...groupBaseOption,
      name: 'AI服务',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://chat.openai.com/cdn-cgi/trace',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ChatGPT.png',
    },
    {
      ...groupBaseOption,
      name: 'Telegram',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'http://www.telegram.org/img/website_icon.svg',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png',
    },
    {
      ...groupBaseOption,
      name: 'WhatsApp',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://web.whatsapp.com/data/manifest.json',
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/whatsapp.svg',
    },
    {
      ...groupBaseOption,
      name: 'Line',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://line.me/page-data/app-data.json',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Line.png',
    },
    {
      ...groupBaseOption,
      name: 'YouTube',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://www.youtube.com/s/desktop/494dd881/img/favicon.ico',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png',
    },
    {
      ...groupBaseOption,
      name: 'Netflix',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://api.fast.com/netflix/speedtest/v2?https=true',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png',
    },
    {
      ...groupBaseOption,
      name: 'HBO',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://www.hbo.com/favicon.ico',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/HBO.png',
    },
    {
      ...groupBaseOption,
      name: 'Disney+',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://disney.api.edge.bamgrid.com/devices',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Disney+.png',
    },
    {
      ...groupBaseOption,
      name: 'Spotify',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'http://spclient.wg.spotify.com/signup/public/v1/account',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png',
    },
    {
      ...groupBaseOption,
      name: '哔哩哔哩国际版',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames],
      url: 'https://www.bilibili.tv/',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili_3.png',
    },
    {
      ...groupBaseOption,
      name: 'Tiktok',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames, 'DIRECT'],
      url: 'https://www.tiktok.com/',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png',
    },
    {
      ...groupBaseOption,
      name: '巴哈姆特',
      type: 'select',
      proxies: ['🇨🇳 台湾', 'DIRECT'],
      url: 'https://ani.gamer.com.tw/ajax/getdeviceid.php',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png',
    },
    {
      ...groupBaseOption,
      name: '游戏服务',
      type: 'select',
      proxies: ['默认节点', ...regionalProxyNames, 'DIRECT'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Game.png',
    },
    {
      ...groupBaseOption,
      name: '日本专用',
      type: 'select',
      proxies: ['🇯🇵 日本', 'DIRECT'],
      url: 'https://r.r10s.jp/com/img/home/logo/touch.png',
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/JP.png',
    },
    {
      ...groupBaseOption,
      name: '广告过滤',
      type: 'select',
      proxies: ['REJECT', 'DIRECT'],
      icon: 'https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Advertising.png',
    },
    ...reginalProxyGroups
  ];
}

function setRules(config) {
  // 规则集通用配置
  const ruleProviderCommon = {
    /**
     * 必须，provider类型，可选http / file / inline
     */
    type: 'http',
    /**
   * 更新provider的时间，单位为秒
   */
    interval: 86400,
    /**
     * 格式，可选 yaml/text/mrs，默认 yaml
     * mrs目前 behavior 仅支持 domain/ipcidr，可以通过mihomo convert-ruleset domain/ipcidr yaml/text XXX.yaml XXX.mrs转换得到
     */
    format: 'mrs',
  };
  /**
   * 规则集合
   */
  config['rule-providers'] = {
    adblockmihomo: {
      ...ruleProviderCommon,
      behavior: 'domain',
      url: 'https://github.com/217heidai/adblockfilters/raw/refs/heads/main/rules/adblockmihomo.mrs',
      path: './rulesets/adblockmihomo.mrs',
    },
  };
  /**
   * 规则
   */
  config['rules'] = [
    'DOMAIN-SUFFIX,meta.com,AI服务',

    'RULE-SET,adblockmihomo,广告过滤',
    'GEOSITE,category-ads-all,广告过滤',

    'GEOSITE,private,DIRECT',
    'GEOIP,private,DIRECT,no-resolve',
    'GEOSITE,cn,DIRECT',
    'GEOIP,CN,DIRECT',
    'GEOIP,jp,日本专用,no-resolve',

    'GEOSITE,github,Github',
    'GEOSITE,google,谷歌服务',
    'GEOSITE,apple-cn,苹果服务',
    'GEOSITE,microsoft@cn,DIRECT',
    'GEOSITE,microsoft,微软服务',
    'GEOSITE,jetbrains-ai,AI服务',
    'GEOSITE,category-ai-!cn,AI服务',
    'GEOSITE,category-ai-chat-!cn,AI服务',
    'GEOSITE,whatsapp,WhatsApp',
    'GEOSITE,line,Line',
    'GEOSITE,youtube,YouTube',
    'GEOSITE,netflix,Netflix',
    'GEOSITE,hbo,HBO',
    'GEOSITE,disney,Disney+',
    'GEOSITE,spotify,Spotify',
    'GEOSITE,biliintl,哔哩哔哩国际版',
    'GEOSITE,tiktok,Tiktok',
    'GEOSITE,bahamut,巴哈姆特',
    'GEOSITE,steam@cn,DIRECT',
    'GEOSITE,category-games@cn,DIRECT',
    'GEOSITE,category-games,游戏服务',
    'GEOSITE,category-bank-jp,日本专用',
    'GEOIP,telegram,Telegram',

    'MATCH,默认节点',
  ];
}

function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.['proxy-providers'] === 'object'
      ? Object.keys(config['proxy-providers']).length
      : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error('配置文件中未找到任何代理');
  }

  setGlobalConfig(config);
  setDnsConfig(config);
  setSnifferConfig(config);
  setProxyGroups(config);
  setRules(config);

  return config;
}
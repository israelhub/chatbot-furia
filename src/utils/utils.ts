import * as cheerio from "cheerio";
import { DataType, Match } from "../types/index.ts";

/**
 * Extrai o texto da primeira tabela que corresponde ao seletor e formata como uma tabela de texto
 */
export function parseFirstTable(html: string, selector: string): string {
  const $ = cheerio.load(html);
  const table = $(selector).first();

  // Se não encontrou tabela, retorna mensagem de erro
  if (table.length === 0) {
    return "Não foi possível encontrar as informações solicitadas.";
  }

  // Extrai cabeçalhos e linhas
  const headers: string[] = [];
  const rows: string[][] = [];

  // Processa cabeçalhos (th)
  table
    .find("tr")
    .first()
    .find("th")
    .each((_, elem) => {
      const header = $(elem).text().trim();
      if (header) headers.push(header);
    });

  // Se não encontrou cabeçalhos, tenta usar as primeiras células como cabeçalho
  if (headers.length === 0) {
    table
      .find("tr")
      .first()
      .find("td")
      .each((_, elem) => {
        const header = $(elem).text().trim();
        if (header) headers.push(header);
      });
  }

  // Processa linhas (td)
  table.find("tr").each((i, row) => {
    // Pula a primeira linha se já foi usada como cabeçalho
    if (i === 0 && headers.length > 0) return;

    const cells: string[] = [];
    $(row)
      .find("td")
      .each((_, cell) => {
        cells.push($(cell).text().trim().replace(/\s+/g, " "));
      });

    // Adiciona apenas linhas que tenham conteúdo
    if (cells.some((cell) => cell.length > 0)) {
      rows.push(cells);
    }
  });

  // Retorna os dados em formato de objeto para manipulação posterior
  return JSON.stringify({ headers, rows });
}

/**
 * Formata resultados de partidas como lista humanizada
 * Versão simplificada: mostra apenas data e placar em formato português
 */
export function formatMatchResults(resultsText: string): string {
  try {
    // Log do texto bruto recebido
    console.log(`🔍 DADOS BRUTOS PARA FORMATAÇÃO (results):`, resultsText);

    // Tenta converter o texto para objeto
    const data = JSON.parse(resultsText);
    const { rows } = data;

    // Log dos dados após parsing JSON
    console.log(`🔍 DADOS APÓS PARSING JSON (results):`, {
      rowsLength: rows.length,
      sampleRow: rows.length > 0 ? rows[0] : null,
    });

    // Limita a 5 resultados
    const limitedRows = rows.slice(0, 5);

    // Mapeia nomes dos meses em inglês para português
    const mesesEmPortugues: { [key: string]: string } = {
      Jan: "janeiro",
      Feb: "fevereiro",
      Mar: "março",
      Apr: "abril",
      May: "maio",
      Jun: "junho",
      Jul: "julho",
      Aug: "agosto",
      Sep: "setembro",
      Oct: "outubro",
      Nov: "novembro",
      Dec: "dezembro",
    };

    // Formata como lista humanizada
    let result = "";

    limitedRows.forEach((row: string[]) => {
      // Com base nos dados brutos, extraímos as informações corretas
      const dateRaw = row[0]?.trim() || "";
      const scoreRaw = row[7]?.trim() || "0 : 0";
      const opponent = row[8]?.trim() || "Adversário";

      // Formata a data: "Apr 09, 2025 - 15:50 EEST" -> "9 de abril de 2025"
      let formattedDate = "";
      try {
        // Formato esperado: "Apr 09, 2025 - 15:50 EEST"
        // Extrai apenas "Apr 09"
        const dateTimeParts = dateRaw.split(" - ");
        const datePart = dateTimeParts[0]; // "Apr 09, 2025"

        // Separa a data
        const dateComponents = datePart.split(", ");
        const monthDayStr = dateComponents[0]; // "Apr 09"
        const yearStr = dateComponents[1] || "2025"; // "2025"

        // Separa mês e dia
        const monthDay = monthDayStr.split(" ");
        const monthAbbr = monthDay[0]; // "Apr"
        const day = monthDay[1] || "01"; // "09"

        // Converte para formato português
        const monthInPortuguese =
          mesesEmPortugues[monthAbbr] || monthAbbr.toLowerCase();

        // Remove zeros à esquerda no dia (09 -> 9)
        const dayNumber = parseInt(day);

        // Formato final: "9 de abril de 2025"
        formattedDate = `${dayNumber} de ${monthInPortuguese} de ${yearStr}`;
      } catch (e) {
        console.error("Erro ao formatar data:", e, "Data original:", dateRaw);
        formattedDate = dateRaw.split(" - ")[0] || dateRaw; // Fallback para data original
      }

      // Formata o resultado
      result += `• ${formattedDate}: FURIA ${scoreRaw} ${opponent}\n`;
    });

    return result.trim();
  } catch (error) {
    // Se houver erro no parsing, retorna o texto original
    console.error("Erro ao formatar resultados:", error);
    return resultsText;
  }
}

/**
 * Formata informações de jogadores como lista humanizada
 * Versão simplificada: apenas nome do jogador e nome real
 */
export function formatPlayerInfo(playersText: string): string {
  try {
    // Log do texto bruto recebido
    console.log(`🔍 DADOS BRUTOS PARA FORMATAÇÃO (players):`, playersText);

    // Tenta converter o texto para objeto
    const data = JSON.parse(playersText);
    const { rows } = data;

    // Log dos dados após parsing JSON
    console.log(`🔍 DADOS APÓS PARSING JSON (players):`, {
      rowsLength: rows.length,
      sampleRow: rows.length > 0 ? rows[0] : null,
    });

    // Limita a 6 jogadores
    const limitedRows = rows.slice(0, 6);

    // Formata como lista humanizada
    let result = "";

    // Mapeamento de nomes de jogadores para nomes reais
    const realNames: { [key: string]: string } = {
      yuurih: "Yuri Boian",
      KSCERATO: "Kaike Cerato",
      FalleN: "Gabriel Toledo",
      molodoy: "Danil Golubenko",
      YEKINDAR: "Mareks Gaļinskis",
      sidde: "Sidnei Macedo",
    };

    limitedRows.forEach((row: string[]) => {
      const name = row[0]?.trim() || "";

      if (name) {
        // Busca o nome real no mapeamento ou usa string vazia
        const realName = realNames[name] || "";
        result += `• ${name}${realName ? ` (${realName})` : ""}\n`;
      }
    });

    return result.trim();
  } catch (error) {
    // Se houver erro no parsing, tenta fazer o parsing de forma diferente
    console.error("Erro ao formatar informações de jogadores:", error);

    // Log do erro e texto original
    console.log("Tentando proceder com parsing alternativo para:", playersText);

    // Tenta processar texto bruto
    const lines = playersText.trim().split("\n");
    let result = "";

    // Mapeamento de nomes de jogadores para nomes reais
    const realNames: { [key: string]: string } = {
      yuurih: "Yuri Boian",
      KSCERATO: "Kaike Cerato",
      FalleN: "Gabriel Toledo",
      molodoy: "Danil Golubenko",
      YEKINDAR: "Mareks Gaļinskis",
      sidde: "Sidnei Macedo",
    };

    // Pula a primeira linha se for um cabeçalho
    const startIndex =
      lines[0].includes("Nome") || lines[0].includes("ID") ? 1 : 0;

    // Processa até 6 jogadores
    for (let i = startIndex; i < Math.min(startIndex + 6, lines.length); i++) {
      const parts = lines[i]
        .split("|")
        .map((part) => part.trim())
        .filter((part) => part);
      if (parts.length > 0) {
        const name = parts[0];
        // Busca o nome real no mapeamento ou usa string vazia
        const realName = realNames[name] || "";
        result += `• ${name}${realName ? ` (${realName})` : ""}\n`;
      }
    }

    return result.trim() || playersText;
  }
}

/**
 * Retorna um nome legível para o tipo de dado
 */
export function getReadableDataTypeName(type: DataType): string {
  const names = {
    [DataType.PLAYERS]: "jogadores",
    [DataType.RESULTS]: "resultados recentes",
    [DataType.HISTORY]: "história da FURIA",
    [DataType.NEXT_MATCHES]: "próximas partidas",
    [DataType.LAST_MATCH]: "último jogo",
  };
  return names[type] || type;
}

/**
 * Extrai e formata informações de próximas partidas a partir do HTML
 * Segue o princípio de responsabilidade única dividindo a extração e formatação em funções separadas
 */
export function formatNextMatches(nextMatchesHtml: string): string {
  try {
    // Log do HTML bruto recebido
    console.log(`🔍 DADOS BRUTOS HTML PARA FORMATAÇÃO (nextMatches):`, 
      nextMatchesHtml.substring(0, 200) + "...");
    
    // Extrai os dados do HTML
    const matches = extractNextMatchesFromHtml(nextMatchesHtml);
    
    // Formata os dados extraídos
    return formatNextMatchesData(matches);
  } catch (error) {
    // Se houver erro no parsing, retorna mensagem amigável
    console.error("Erro ao formatar próximas partidas:", error);
    return "Não foi possível processar os dados de próximas partidas.";
  }
}

/**
 * Extrai dados de próximas partidas do HTML
 * Responsabilidade: apenas extrair os dados estruturados do HTML
 */
function extractNextMatchesFromHtml(html: string): Match[] {
  const $ = cheerio.load(html);
  const matches: Match[] = [];
  
  // Extrai a data do cabeçalho
  const dateText = $(".MatchList__MatchListDate-sc-1pio0qc-0").text().trim();
  // Formato esperado: "📅 sábado, 10 de maio de 2025"
  const dateMatch = dateText.match(/📅\s+(.*)/);
  const matchDate = dateMatch ? dateMatch[1] : "";
  
  // Extrai informações de cada partida
  $(".MatchCardSimple__MatchContainer-sc-wcmxha-0").each((_, matchElement) => {
    // Extrai horário
    const timeText = $(matchElement).find(".MatchCardSimple__MatchTime-sc-wcmxha-3").text().trim();
    
    // Extrai times
    const teams = $(matchElement).find(".MatchCardSimple__MatchTeam-sc-wcmxha-11");
    
    // Primeiro time
    const team1Element = $(teams[0]);
    const team1Name = team1Element.find(".MatchCardSimple__TeamNameAndLogo-sc-wcmxha-40 span").text().trim();
    const team1Logo = team1Element.find("img").attr("src") || "";
    const team1Score = team1Element.find(".MatchCardSimple__Score-sc-wcmxha-15").text().trim();
    
    // Segundo time
    const team2Element = $(teams[1]);
    const team2Name = team2Element.find(".MatchCardSimple__TeamNameAndLogo-sc-wcmxha-40 span").text().trim();
    const team2Logo = team2Element.find("img").attr("src") || "";
    const team2Score = team2Element.find(".MatchCardSimple__Score-sc-wcmxha-15").text().trim();
    
    // Informações adicionais
    const matchFormat = $(matchElement).find(".MatchCardSimple__Badge-sc-wcmxha-18").text().trim();
    const tournament = $(matchElement).find(".MatchCardSimple__Tournament-sc-wcmxha-34").text().trim();
    const matchUrl = $(matchElement).attr("href") || "";
    
    // Adiciona os dados extraídos ao array
    matches.push({
      date: matchDate,
      time: timeText,
      team1: {
        name: team1Name,
        logo: team1Logo,
        score: team1Score
      },
      team2: {
        name: team2Name,
        logo: team2Logo,
        score: team2Score
      },
      format: matchFormat,
      tournament,
      url: matchUrl
    });
  });
  
  return matches;
}

/**
 * Formata os dados de próximas partidas para exibição
 * Responsabilidade: apenas formatar os dados já extraídos
 */
function formatNextMatchesData(matches: Match[]): string {
  if (matches.length === 0) {
    return "Não há partidas agendadas no momento.";
  }
  
  let result = `📆 Próximas Partidas\n\n`;
  
  // Agrupa partidas por data
  const currentDate = matches[0]?.date || "";
  result += `${currentDate}\n`;
  
  // Formata cada partida
  matches.forEach((match) => {
    const team1 = match.team1.name;
    const team2 = match.team2.name;
    const time = match.time;
    const format = match.format;
    const tournament = match.tournament;
    
    result += `• ${time} - ${team1} vs ${team2} (${format.trim()}) - ${tournament}\n`;
  });
  
  return result.trim();
}

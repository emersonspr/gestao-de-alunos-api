import { api } from '../helpers/api.js'
import { expect } from 'chai';
import { comTokenDeAdmin, comTokenDeAluno } from '../helpers/auth.js';
import { novoAluno } from '../factories/alunosFactory.js';
import { novaDisciplina } from '../factories/disciplinasFactory.js';
import trabalhosDaDisciplina from '../fixtures/trabalhos.json' with { type: 'json' };

describe("Entrega de Trabalho da Disciplina por um Aluno", () => {

    it("Validar a entrega de um trabalho da disciplina", async () => {
        
        //Cadastro do Aluno
        const dadosAluno = novoAluno();

        const cadastroAlunoResposta = await api()
            .post("/api/admin/alunos")
            .set("Content-Type", "application/json")
            .set("Authorization", await comTokenDeAdmin())
            .send(dadosAluno);

        const alunoId = cadastroAlunoResposta.body.id;

        //Cadastro da Disciplina
        const cadastroDisciplinaResposta = await api()
            .post("/api/admin/disciplinas")
            .set("Content-Type", "application/json")
            .set("Authorization", await comTokenDeAdmin())
            .send(novaDisciplina());

        const disciplinaId = cadastroDisciplinaResposta.body.id;

        //Matricula do aluno
        const cadastroMatriculaResposta = await api()
            .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
            .set("Content-Type", "application/json")
            .set("Authorization", await comTokenDeAdmin())
            .send({
                alunoId: alunoId
            });

        //Validações de Cadastro e Matrícula de Aluno
        expect(cadastroMatriculaResposta.status).to.equal(201);
        expect(cadastroMatriculaResposta.body.alunoId).to.equal(alunoId);
        expect(cadastroMatriculaResposta.body.disciplinaId).to.equal(disciplinaId);

        //Login como aluno
        const tokenAluno = await comTokenDeAluno(
            dadosAluno.email,
            dadosAluno.senha
            );

        //Cadastro de Trabalho como Aluno
        const trabalho = trabalhosDaDisciplina[0];

        const cadastroTrabalhoResposta = await api()
            .post(`/api/alunos/${alunoId}/trabalhos`)
            .set("Content-Type", "application/json")
            .set("Authorization", tokenAluno)
            .send({
                disciplinaId: disciplinaId,
                titulo: trabalho.titulo,
                descricao: trabalho.descricao
            });

        //Validações da entrega do trabalho
        expect(cadastroTrabalhoResposta.status).to.equal(201);
        expect(cadastroTrabalhoResposta.body.alunoId).to.equal(alunoId);
        expect(cadastroTrabalhoResposta.body.disciplinaId).to.equal(disciplinaId);
        expect(cadastroTrabalhoResposta.body.titulo).to.equal(trabalho.titulo);
        expect(cadastroTrabalhoResposta.body.descricao).to.equal(trabalho.descricao);
        expect(cadastroTrabalhoResposta.body.status).to.equal(trabalho.statusDeEntrega.toLowerCase());

        console.log('Validações concluídas.');
  });

});
